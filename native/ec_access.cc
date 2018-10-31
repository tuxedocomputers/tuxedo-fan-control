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
        usleep(1000);
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

static int ReadByte()
{
    int i = 1000000;
    int value = 0;
    while ((inb(EC_COMMAND_PORT) & 0x1) == 0 && i > 0)
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
    int i = 1000000;
    while ((inb(EC_COMMAND_PORT) & 0x2) == 0x2 && i > 0)
    {
        i -= 1;
    }

    if (i == 0)
    {
        return EXIT_FAILURE;
    }
    else
    {
        outb(command, EC_COMMAND_PORT);
        return EXIT_SUCCESS;
    }
}

static int WriteData(int data)
{
    int i = 1000000;
    while ((inb(EC_COMMAND_PORT) & 0x2) == 0x2 && i > 0)
    {
        i -= 1;
    }

    if (i == 0)
    {
        return EXIT_FAILURE;
    }
    else
    {
        outb(data, EC_DATA_PORT);
        return EXIT_SUCCESS;
    }
}

static int ReadValue(int command)
{
    EcInit();
    //EcFlush();
    SendCommand(command);
    return ReadByte();
}

int GetTempFanDuty(int index, int *remote, int *local, int *fan_duty)
{
    SendCommand(TEMP);
    WriteData(index);
    *remote = ReadByte();
    *local = ReadByte();
    *fan_duty = ReadByte();

    return 0;
}

Napi::Number GetCpuFanDutyNew(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(1, &remote, &local, &fan_duty);
    fan_duty_perc = ((float)fan_duty / (float)255) * 100;

    return Napi::Number::New(env, ((int)(fan_duty_perc + 0.5)));
}

Napi::Number GetCpuFanTempLocal(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(1, &remote, &local, &fan_duty);

    return Napi::Number::New(env, local);
}

Napi::Number GetCpuFanTempRemote(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(1, &remote, &local, &fan_duty);

    return Napi::Number::New(env, remote);
}

Napi::Number GetGpuFanDutyNew(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(2, &remote, &local, &fan_duty);
    fan_duty_perc = ((float)fan_duty / (float)255) * 100;

    return Napi::Number::New(env, ((int)(fan_duty_perc + 0.5)));
}

Napi::Number GetGpuFanTempLocal(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(2, &remote, &local, &fan_duty);

    return Napi::Number::New(env, local);
}

Napi::Number GetGpuFanTempRemote(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(2, &remote, &local, &fan_duty);

    return Napi::Number::New(env, remote);
}

Napi::Number GetGpuTwoFanDutyNew(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(3, &remote, &local, &fan_duty);
    fan_duty_perc = ((float)fan_duty / (float)255) * 100;

    return Napi::Number::New(env, ((int)(fan_duty_perc + 0.5)));
}

Napi::Number GetGpuTwoFanTempLocal(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(3, &remote, &local, &fan_duty);

    return Napi::Number::New(env, local);
}

Napi::Number GetGpuTwoFanTempRemote(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    int remote = 0;
    int local = 0;
    int fan_duty = 0;
    float fan_duty_perc = 0;

    GetTempFanDuty(3, &remote, &local, &fan_duty);

    return Napi::Number::New(env, remote);
}

Napi::Number GetRawCpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    //int value = ReadValue(EC_REG_CPU_FAN_DUTY);
    EcInit();
    int value = EcIoRead(EC_REG_CPU_FAN_DUTY);

    return Napi::Number::New(env, value);
}

Napi::Number GetCpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    //int value = ReadValue(EC_REG_CPU_FAN_DUTY);
    EcInit();
    int value = EcIoRead(EC_REG_CPU_FAN_DUTY);

    return Napi::Number::New(env, ((int) ((double) value / 255.0 * 100.0)));
}

Napi::Number GetCpuTemp(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    //int value = ReadValue(EC_REG_CPU_TEMP);
    EcInit();
    int value = EcIoRead(EC_REG_CPU_TEMP);

    return Napi::Number::New(env, value);
}

static int calculate_fan_rpms(int raw_rpm_high, int raw_rpm_low)
{
    int raw_rpm = (raw_rpm_high << 8) + raw_rpm_low;
    return raw_rpm > 0 ? (2156220 / raw_rpm) : 0;
}

Napi::Number GetCpuFanRpm(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    // int raw_rpm_hi = ReadValue(EC_REG_CPU_FAN_RPMS_HI);
    // int raw_rpm_lo = ReadValue(EC_REG_CPU_FAN_RPMS_LO);
    EcInit();
    int raw_rpm_hi = EcIoRead(EC_REG_CPU_FAN_RPMS_HI);
    int raw_rpm_lo = EcIoRead(EC_REG_CPU_FAN_RPMS_LO);;

    return Napi::Number::New(env, calculate_fan_rpms(raw_rpm_hi, raw_rpm_lo));
}

Napi::Number GetGpuTemp(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    // int value = ReadValue(EC_REG_GPU_TEMP);
    EcInit();
    int value = EcIoRead(EC_REG_GPU_TEMP);

    return Napi::Number::New(env, value);
}

Napi::Number GetRawGpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    // int value = ReadValue(EC_REG_GPU_FAN_DUTY);
    EcInit();
    int value = EcIoRead(EC_REG_GPU_FAN_DUTY);

    return Napi::Number::New(env, value);
}

Napi::Number GetGpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    // int value = ReadValue(EC_REG_GPU_FAN_DUTY);
    EcInit();
    int value = EcIoRead(EC_REG_GPU_FAN_DUTY);

    return Napi::Number::New(env, ((int) ((double) value / 255.0 * 100.0)));
}

Napi::Number GetGpuFanRpm(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    // int raw_rpm_hi = ReadValue(EC_REG_GPU_FAN_RPMS_HI);
    // int raw_rpm_lo = ReadValue(EC_REG_GPU_FAN_RPMS_LO);
    EcInit();
    int raw_rpm_hi = EcIoRead(EC_REG_GPU_FAN_RPMS_HI);
    int raw_rpm_lo = EcIoRead(EC_REG_GPU_FAN_RPMS_LO);

    return Napi::Number::New(env, calculate_fan_rpms(raw_rpm_hi, raw_rpm_lo));
}

static int ec_io_do(const uint32_t cmd, const uint32_t port, const uint8_t value)
{
    EcIoWait(EC_COMMAND_PORT, IBF, 0);
    outb(cmd, EC_COMMAND_PORT);

    EcIoWait(EC_COMMAND_PORT, IBF, 0);
    outb(port, EC_DATA_PORT);

    EcIoWait(EC_COMMAND_PORT, IBF, 0);
    outb(value, EC_DATA_PORT);

    return EcIoWait(EC_COMMAND_PORT, IBF, 0);
}

static int ec_write_cpu_fan_duty(uint32_t duty_percentage)
{
    int duty_value = (int)(((double)duty_percentage) / 100.0 * 255.0 + 0.5);

    return ec_io_do(0x99, 0x01, duty_value);
}

Napi::Boolean SetCpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() != 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[0].IsNumber())
    {
        Napi::TypeError::New(env, "Wrong argument").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    uint32_t fanDuty = info[0].As<Napi::Number>();

    if (fanDuty < 1 || fanDuty > 100)
    {
        std::string message = "Wrong fan duty to write: " + std::to_string(fanDuty) + "\n";
        Napi::Error::New(env, message).ThrowAsJavaScriptException();

        return Napi::Boolean::New(env, false);
    }

    if(ec_write_cpu_fan_duty(fanDuty) == 0)
    {
        return Napi::Boolean::New(env, true);
    }
    else
    {
        return Napi::Boolean::New(env, false);
    }
}

static int ec_write_gpu_fan_duty(int duty_percentage)
{
    int duty_value = (int)(((double)duty_percentage) / 100.0 * 255.0 + 0.5);
    return ec_io_do(0x99, 0x02, duty_value);
}

Napi::Boolean SetGpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() != 1)
    {
        Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    if (!info[0].IsNumber())
    {
        Napi::TypeError::New(env, "Wrong argument").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    uint32_t fanDuty = info[0].As<Napi::Number>();

    if (fanDuty < 1 || fanDuty > 100)
    {
        std::string message = "Wrong fan duty to write: " + std::to_string(fanDuty) + "\n";
        Napi::Error::New(env, message).ThrowAsJavaScriptException();

        return Napi::Boolean::New(env, false);
    }

    if(ec_write_gpu_fan_duty(fanDuty) == 0)
    {
        return Napi::Boolean::New(env, true);
    }
    else
    {
        return Napi::Boolean::New(env, false);
    }
}

Napi::Object init(Napi::Env env, Napi::Object exports)
{
    printf("test: haha\n");

    // CPU Methods
    // CPU Fan Duty - Read
    exports.Set(Napi::String::New(env, "getCpuFanDuty"), Napi::Function::New(env, GetCpuFanDuty));
    exports.Set(Napi::String::New(env, "getRawCpuFanDuty"), Napi::Function::New(env, GetRawCpuFanDuty));
    // CPU Temp - Read
    exports.Set(Napi::String::New(env, "getCpuTemp"), Napi::Function::New(env, GetCpuTemp));
    // CPU Fan RPM - Read
    exports.Set(Napi::String::New(env, "getCpuFanRpm"), Napi::Function::New(env, GetCpuFanRpm));

    // GPU Methods
    // GPU Fan Duty - Read
    exports.Set(Napi::String::New(env, "getGpuFanDuty"), Napi::Function::New(env, GetGpuFanDuty));
    exports.Set(Napi::String::New(env, "getRawGpuFanDuty"), Napi::Function::New(env, GetRawGpuFanDuty));
    // GPU Temp - Read
    exports.Set(Napi::String::New(env, "getGpuTemp"), Napi::Function::New(env, GetGpuTemp));
    // GPU Fan RPM - Read
    exports.Set(Napi::String::New(env, "getGpuFanRpm"), Napi::Function::New(env, GetGpuFanRpm));

    // Set CPU Fan Duty - Write
    exports.Set(Napi::String::New(env, "setCpuFanDuty"), Napi::Function::New(env, SetCpuFanDuty));

    // Set GPU Fan Duty - Write
    exports.Set(Napi::String::New(env, "setGpuFanDuty"), Napi::Function::New(env, SetGpuFanDuty));

    // GetCpuFanDutyNew
    // GetGpuFanDutyNew
    // GetGpuTwoFanDutyNew
    // GetGpuTwoFanTempLocal
    // GetGpuTwoFanTempRemote

    exports.Set(Napi::String::New(env, "getCpuFanDutyNew"), Napi::Function::New(env, GetCpuFanDutyNew));
    exports.Set(Napi::String::New(env, "getCpuFanTempLocal"), Napi::Function::New(env, GetCpuFanTempLocal));
    exports.Set(Napi::String::New(env, "getCpuFanTempRemote"), Napi::Function::New(env, GetCpuFanTempRemote));

    exports.Set(Napi::String::New(env, "getGpuFanDutyNew"), Napi::Function::New(env, GetGpuFanDutyNew));
    exports.Set(Napi::String::New(env, "getGpuFanTempLocal"), Napi::Function::New(env, GetGpuFanTempLocal));
    exports.Set(Napi::String::New(env, "getGpuFanTempRemote"), Napi::Function::New(env, GetCpuFanTempRemote));

    exports.Set(Napi::String::New(env, "getGpuTwoFanDutyNew"), Napi::Function::New(env, GetGpuTwoFanDutyNew));
    exports.Set(Napi::String::New(env, "getGpuTwoFanTempLocal"), Napi::Function::New(env, GetGpuTwoFanTempLocal));
    exports.Set(Napi::String::New(env, "getGpuTwoFanTempRemote"), Napi::Function::New(env, GetGpuTwoFanTempRemote));

    return exports;
};

NODE_API_MODULE(hello_world, init);
