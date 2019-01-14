#include <napi.h>

#include <sys/io.h>
#include <unistd.h>

#define EC_COMMAND_PORT         0x66
#define EC_DATA_PORT            0x62

#define IBF                     1
#define OBF                     0
#define EC_SC_READ_CMD          0x80

#define EC_REG_CPU_FAN_RPMS_HI  0xD0
#define EC_REG_CPU_FAN_RPMS_LO  0xD1
#define EC_REG_GPU_FAN_RPMS_HI  0xD2
#define EC_REG_GPU_FAN_RPMS_LO  0xD3

#define TEMP                    0x9E

/** 
 * Set IO port input/output permissions
 * On success, zero is returned. On error, -1 is returned, and errno is
 * set appropriately.
 * 
 * @return Status of Operation
*/
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

/**
 * Wait on EC
 * 
 * @param port The port for waiting
 * @param flag 
 * @param value
 * 
 * @return Status of Operation
*/
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

/**
 * Read the Port informations
 * 
 * @param port The port for waiting
 * 
 * @return the Data
*/
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

/**
 * Flush the EC
*/
static void EcFlush()
{
    while ((inb(EC_COMMAND_PORT) & 0x1) == 0x1)
    {
        inb(EC_DATA_PORT);
    }
}

/**
 * Read a byte from EC
 * 
 * @return Returns the current byte
*/
static int ReadByte()
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

/**
 * Send a command to the ec
 * 
 * @param command the comamnd to send
*/
static void SendCommand(int command)
{
    int tt = 0;
    while((inb(EC_COMMAND_PORT) & 2))
    {
        tt++;
        if(tt>30000)
        {
            break;
        }
    }

    outb(command, EC_COMMAND_PORT);
}

/**
 * Write data to ec
 * 
 * @param data the data to write
*/
static void WriteData(int data)
{
    while((inb(EC_COMMAND_PORT) & 2));

    outb(data, EC_DATA_PORT);
}

/**
 * Read the Callbackinforamtions Envoiroment and returns the Index of the fan parameter
 * 
 * @param info the nodejs CallbackInfo
 * 
 * @return The index of the fan
*/
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

/**
 * Read and return the Raw Fan duty of fan
 * 
 * @param index the fan index
 * 
 * @return the fan duty value
*/
static int RawFanDuty(int index)
{
    EcInit();
    EcFlush();

    SendCommand(TEMP);
    WriteData(index);

    ReadByte();
    ReadByte();
    int value = ReadByte();

    return value;
}

/**
 * Get the clean Fan Duty in percent
 * 
 * @param info the nodejs CallbackInfo
 * 
 * @return The current fan duty of fan in percent
*/
Napi::Number GetFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    float fan_duty_perc = 0;
    int index = GetFanDutyIndexParameter(info);

    int value = RawFanDuty(index);

    fan_duty_perc = ((float)value / (float)255) * 100;

    return Napi::Number::New(env, ((int)(fan_duty_perc + 0.5)));
}

/**
 * Return the raw fan duty (value 0 - 255)
 * 
 * @param info the nodejs CallbackInfo
 * 
 * @return The current raw fan duty of fan (value 0 - 255)
*/
Napi::Number GetRawFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int index = GetFanDutyIndexParameter(info);

    int fanDutyValue = RawFanDuty(index);

    return Napi::Number::New(env, fanDutyValue);
}

/**
 * Read and returns the remote temp of the fan
 * 
 * @param info the nodejs CallbackInfo
 * 
 * @return the remote temp
*/
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

/**
 * Read and returns the local temp of the fan 
 * 
 * @param info the nodejs CallbackInfo
 * 
 * @return the local temp
*/
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

/**
 * Calculate the fan rpms
 * 
 * @param raw_rpm_high The raw high rpm value of the fan
 * @param raw_rpm_low The raw low rpm value of the fan
*/
static int calculate_fan_rpms(int raw_rpm_high, int raw_rpm_low)
{
    int raw_rpm = (raw_rpm_high << 8) + raw_rpm_low;
    return raw_rpm > 0 ? (2156220 / raw_rpm) : 0;
}

/**
 * Read and returns the rpm of the fan 
 * 
 * @param info the nodejs CallbackInfo
 * 
 * @return Returns the fan rpm
*/
Napi::Number GetFanRpm(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int index = GetFanDutyIndexParameter(info);
    int value = 0;

    if(index == 1)
    {
        EcInit();
        EcFlush();

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

/**
 * Set the fan duty
 * 
 * @param info the nodejs CallbackInfo
 * 
 * @return Returns a bool to indicate was the operation sucessfully or not
*/
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

/**
 * Set the fan duty on auto modus
 * 
 * @param info the nodejs CallbackInfo
*/
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
            WriteData(0x01);
            break;
        case 2:
            WriteData(0x02);
            break;
        case 3:
            WriteData(0x03);
            break;
        case 5:
            WriteData(0xff);
            WriteData(0xff);
            break;
        default:
            break;
    }
}

Napi::Object init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "nGetFanDuty"), Napi::Function::New(env, GetFanDuty));
    exports.Set(Napi::String::New(env, "nGetRawFanDuty"), Napi::Function::New(env, GetRawFanDuty));
    exports.Set(Napi::String::New(env, "nGetLocalTemp"), Napi::Function::New(env, GetLocalTemp));
    exports.Set(Napi::String::New(env, "nGetRemoteTemp"), Napi::Function::New(env, GetRemoteTemp));
    exports.Set(Napi::String::New(env, "nGetFanRpm"), Napi::Function::New(env, GetFanRpm));

    exports.Set(Napi::String::New(env, "nSetFanDuty"), Napi::Function::New(env, SetFanDuty));
    exports.Set(Napi::String::New(env, "nSetAutoFanDuty"), Napi::Function::New(env, SetAutoFanDuty));

    return exports;
};

NODE_API_MODULE(NODE_GYP_MODULE_NAME, init);