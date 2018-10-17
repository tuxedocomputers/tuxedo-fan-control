#include <napi.h>

#include <sys/io.h>
#include <unistd.h>

#define EC_SC 0x66
#define EC_DATA 0x62

#define IBF 1
#define OBF 0
#define EC_SC_READ_CMD 0x80

#define EC_REG_SIZE 0x100

#define EC_REG_CPU_FAN_DUTY 0xCE
#define EC_REG_CPU_TEMP 0x07
#define EC_REG_CPU_FAN_RPMS_HI 0xD0
#define EC_REG_CPU_FAN_RPMS_LO 0xD1
#define EC_REG_GPU_FAN_RPMS_HI 0xD2
#define EC_REG_GPU_FAN_RPMS_LO 0xD3
#define EC_REG_GPU_TEMP 0xCD
#define EC_REG_GPU_FAN_DUTY 0xCF

static int ec_init()
{
    if (ioperm(EC_DATA, 1, 1) != 0)
    {
        return EXIT_FAILURE;
    }

    if (ioperm(EC_SC, 1, 1) != 0)
    {
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}

static int ec_io_wait(const uint32_t port, const uint32_t flag, const char value)
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

static uint8_t ec_io_read(const uint32_t port)
{
    ec_io_wait(EC_SC, IBF, 0);
    outb(EC_SC_READ_CMD, EC_SC);

    ec_io_wait(EC_SC, IBF, 0);
    outb(port, EC_DATA);

    ec_io_wait(EC_SC, OBF, 1);
    uint8_t value = inb(EC_DATA);

    return value;
}

Napi::Number GetRawCpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();
    int raw_duty = ec_io_read(EC_REG_CPU_FAN_DUTY);

    return Napi::Number::New(env, raw_duty);
}

Napi::Number GetCpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();
    int raw_duty = ec_io_read(EC_REG_CPU_FAN_DUTY);

    return Napi::Number::New(env, ((int) ((double) raw_duty / 255.0 * 100.0)));
}

Napi::Number GetCpuTemp(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();
    int cpu_temp = ec_io_read(EC_REG_CPU_TEMP);

    return Napi::Number::New(env, cpu_temp);
}

static int calculate_fan_rpms(int raw_rpm_high, int raw_rpm_low)
{
    int raw_rpm = (raw_rpm_high << 8) + raw_rpm_low;
    return raw_rpm > 0 ? (2156220 / raw_rpm) : 0;
}

Napi::Number GetCpuFanRpm(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();

    int raw_rpm_hi = ec_io_read(EC_REG_CPU_FAN_RPMS_HI);
    int raw_rpm_lo = ec_io_read(EC_REG_CPU_FAN_RPMS_LO);

    return Napi::Number::New(env, calculate_fan_rpms(raw_rpm_hi, raw_rpm_lo));
}

Napi::Number GetGpuTemp(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();
    int gpu_temp = ec_io_read(EC_REG_GPU_TEMP);

    return Napi::Number::New(env, gpu_temp);
}

Napi::Number GetRawGpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();
    int raw_duty = ec_io_read(EC_REG_GPU_FAN_DUTY);

    return Napi::Number::New(env, raw_duty);
}

Napi::Number GetGpuFanDuty(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();
    int raw_duty = ec_io_read(EC_REG_GPU_FAN_DUTY);

    return Napi::Number::New(env, ((int) ((double) raw_duty / 255.0 * 100.0)));
}

Napi::Number GetGpuFanRpm(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    ec_init();

    int raw_rpm_hi = ec_io_read(EC_REG_GPU_FAN_RPMS_HI);
    int raw_rpm_lo = ec_io_read(EC_REG_GPU_FAN_RPMS_LO);

    return Napi::Number::New(env, calculate_fan_rpms(raw_rpm_hi, raw_rpm_lo));
}

static int ec_io_do(const uint32_t cmd, const uint32_t port, const uint8_t value)
{
    ec_io_wait(EC_SC, IBF, 0);
    outb(cmd, EC_SC);

    ec_io_wait(EC_SC, IBF, 0);
    outb(port, EC_DATA);

    ec_io_wait(EC_SC, IBF, 0);
    outb(value, EC_DATA);

    return ec_io_wait(EC_SC, IBF, 0);
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

    return exports;
};

NODE_API_MODULE(hello_world, init);
