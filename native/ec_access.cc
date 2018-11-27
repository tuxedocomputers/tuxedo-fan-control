#include <napi.h>

#include <sys/io.h>
#include <unistd.h>

// #define EC_SC 0x66
#define EC_COMMAND_PORT         0x66
//#define EC_DATA 0x62
#define EC_DATA_PORT            0x62

#define IBF                     1
#define OBF                     0
#define EC_SC_READ_CMD          0x80

#define EC_REG_SIZE             0x100

#define EC_REG_CPU_FAN_DUTY     0xCE
#define EC_REG_CPU_TEMP         0x07
#define EC_REG_CPU_FAN_RPMS_HI  0xD0
#define EC_REG_CPU_FAN_RPMS_LO  0xD1
#define EC_REG_GPU_FAN_RPMS_HI  0xD2
#define EC_REG_GPU_FAN_RPMS_LO  0xD3
#define EC_REG_GPU_TEMP         0xCD
#define EC_REG_GPU_FAN_DUTY     0xCF
#define EC_REG_TEMP             0x9E

#define TEMP                    0x9E

// ioperm - set port input/output permissions
//
// On success, zero is returned.  On error, -1 is returned, and errno is
// set appropriately.
static int EcInit()
{
    if (ioperm(EC_DATA_PORT, 1, 1) != 0)
    {
        return EXIT_FAILURE;
    }

    if (ioperm(EC_COMMAND_PORT, 1, 1) != 0)
    {
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

static int EcIoWait(const uint32_t port, const uint32_t flag, const char value)
{
    uint8_t data = inb(port);
    int i = 0;

    while ((((data >> flag) & 0x1) != value) && (i++ < 100))
    {
        data = inb(port);
    }

    if (i >= 100)
    {
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

static uint8_t EcIoRead(const uint32_t port)
{
    EcIoWait(EC_COMMAND_PORT, IBF, 0);
    outb(EC_SC_READ_CMD, EC_COMMAND_PORT);

    EcIoWait(EC_COMMAND_PORT, IBF, 0);
    outb(port, EC_DATA_PORT);

    EcIoWait(EC_COMMAND_PORT, OBF, 1);
    uint8_t value = inb(EC_DATA_PORT);

    return value;
}

static void EcFlush()
{
    while ((inb(EC_COMMAND_PORT) & 0x1) == 0x1)
    {
        inb(EC_DATA_PORT);
    }
}

static int ReadByte(void)
{
    int i = 1000000;
    while ((inb(EC_COMMAND_PORT) & 1) == 0 && i > 0)
    {
        i -= 1;
    }

    if (i == 0)
    {
        return 0;
    }
    else
    {
        return inb(EC_DATA_PORT);
    }
}

static int SendCommand(int command)
{
    int tt = 0;
    while((inb(EC_COMMAND_PORT) & 2))    /* check if IBE full */
    {
        tt++;
        if(tt>30000)
        {
            break;
        }
    }
    outb(command, EC_COMMAND_PORT);
    return EXIT_SUCCESS;
}

static int WriteData(int data)
{
    while((inb(EC_COMMAND_PORT) & 2));   /* check if IBE full */

    outb(data, EC_DATA_PORT);
    return 0;
}

static int GetFanDutyIndexParameter(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() != 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return -1;
    }

    if (!info[0].IsNumber())
    {
        Napi::TypeError::New(env, "Wrong argument").ThrowAsJavaScriptException();
        return -1;
    }

    uint32_t index = info[0].As<Napi::Number>();
    if(index < 1 || index > 3)
    {
        Napi::TypeError::New(env, "Wrong Index").ThrowAsJavaScriptException();
        return -1;
    }

    return index;
}

static int RawFanDuty(int index)
{
    EcInit();
    EcFlush();

    SendCommand(0x9E);
    WriteData(index);

    // ReadByte();
    // ReadByte();
    // int value = ReadByte();

    EcIoRead(0x9E);
    EcIoRead(0x9E);
    int value = EcIoRead(0x9E);

    return value;
}

Napi::Number GetFanDutyNew(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    float fan_duty_perc = 0;
    int index = GetFanDutyIndexParameter(info);

    int value = RawFanDuty(index);

    fan_duty_perc = ((float)value / (float)255) * 100;

    return Napi::Number::New(env, ((int)(fan_duty_perc + 0.5)));
}

Napi::Number GetRawFanDutyNew(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int index = GetFanDutyIndexParameter(info);

    int fanDutyValue = RawFanDuty(index);

    return Napi::Number::New(env, fanDutyValue);
}

Napi::Number GetRemoteTemp(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int index = GetFanDutyIndexParameter(info);
    
    EcInit();
    EcFlush();

    SendCommand(TEMP);
    WriteData(index);

    int value = ReadByte();

    return Napi::Number::New(env, value);
}

Napi::Number GetLocalTemp(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int index = GetFanDutyIndexParameter(info);
    
    EcInit();
    EcFlush();

    SendCommand(TEMP);
    WriteData(index);
    ReadByte();

    int value = ReadByte();

    return Napi::Number::New(env, value);
}

static int calculate_fan_rpms(int raw_rpm_high, int raw_rpm_low)
{
    int raw_rpm = (raw_rpm_high << 8) + raw_rpm_low;
    return raw_rpm > 0 ? (2156220 / raw_rpm) : 0;
}

Napi::Number GetFanRpm(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int index = GetFanDutyIndexParameter(info);
    int value = 0;

    if(index == 1)
    {
        EcInit();
        EcFlush();

        // SendCommand(EC_REG_CPU_FAN_RPMS_HI);
        // int raw_rpm_hi = ReadByte();

        // SendCommand(EC_REG_CPU_FAN_RPMS_LO);
        // int raw_rpm_lo = ReadByte();

        int raw_rpm_hi = EcIoRead(EC_REG_CPU_FAN_RPMS_HI);
        int raw_rpm_lo = EcIoRead(EC_REG_CPU_FAN_RPMS_LO);

        value = calculate_fan_rpms(raw_rpm_hi, raw_rpm_lo);
    }
    else if(index == 2)
    {
        EcInit();
        EcFlush();
        int raw_rpm_hi = EcIoRead(EC_REG_GPU_FAN_RPMS_HI);
        int raw_rpm_lo = EcIoRead(EC_REG_GPU_FAN_RPMS_LO);

        value = calculate_fan_rpms(raw_rpm_hi, raw_rpm_lo);
    }
    else if(index == 3)
    {
        EcInit();
        EcFlush();
        int raw_rpm_hi = EcIoRead(0xD4);
        int raw_rpm_lo = EcIoRead(0xD5);

        value = calculate_fan_rpms(raw_rpm_hi, raw_rpm_lo);
    }

    return Napi::Number::New(env, value); 
}

Napi::Boolean SetFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() != 2)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[0].IsNumber())
    {
        Napi::TypeError::New(env, "Wrong argument for index").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[1].IsNumber())
    {
        Napi::TypeError::New(env, "Wrong argument for duty").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    uint32_t index = info[0].As<Napi::Number>();
    uint32_t fanDuty = info[1].As<Napi::Number>();

    if (fanDuty < 1 || fanDuty > 255)
    {
        std::string message = "Wrong fan duty to write: " + std::to_string(fanDuty) + "\n";
        Napi::Error::New(env, message).ThrowAsJavaScriptException();

        return Napi::Boolean::New(env, false);
    }

    EcInit();
    SendCommand(0x99);

    switch(index)
    {
        case 1:
            WriteData(0x01);
            break;
        case 2:
            WriteData(0x02);
            break;
        case 3:
            WriteData(0x03);
            break;
        default:
            return Napi::Boolean::New(env, false);
    }

    WriteData(fanDuty);

    return Napi::Boolean::New(env, true);
}

void SetAutoFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
    }

    if (!info[0].IsNumber())
    {
        Napi::TypeError::New(env, "Wrong argument").ThrowAsJavaScriptException();
    }

    uint32_t index = info[0].As<Napi::Number>();
    if(index < 1 || index > 5)
    {
        Napi::TypeError::New(env, "Wrong Index").ThrowAsJavaScriptException();
    }

    EcInit();

    SendCommand(0x99);
	WriteData(0xff);

    switch (index)
	{
        case 1:
            // 1 -> cpu
            WriteData(0x01);
            break;
        case 2:
            // 2 -> vga
            WriteData(0x02);
            break;
        case 3:
            // 2 -> vga
            WriteData(0x03);
            break;
        case 5:
            // 5 -> all
            WriteData(0xff);
            WriteData(0xff);
            break;
        default:
            break;
	}
}

Napi::Object init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "getFanDutyNew"), Napi::Function::New(env, GetFanDutyNew));
    exports.Set(Napi::String::New(env, "getRawFanDutyNew"), Napi::Function::New(env, GetRawFanDutyNew));
    exports.Set(Napi::String::New(env, "getLocalTemp"), Napi::Function::New(env, GetLocalTemp));
    exports.Set(Napi::String::New(env, "getRemoteTemp"), Napi::Function::New(env, GetRemoteTemp));
    exports.Set(Napi::String::New(env, "getFanRpm"), Napi::Function::New(env, GetFanRpm));

    exports.Set(Napi::String::New(env, "setFanDuty"), Napi::Function::New(env, SetFanDuty));
    exports.Set(Napi::String::New(env, "setAutoFanDuty"), Napi::Function::New(env, SetAutoFanDuty));

    return exports;
};

NODE_API_MODULE(NODE_GYP_MODULE_NAME, init);