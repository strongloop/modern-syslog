#include <node.h>
#include <nan.h>
#include <syslog.h>

using v8::Function;
using v8::Int32;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

namespace {

class Worker: public Nan::AsyncWorker {
    public:
        Worker(Nan::Callback *callback, int priority, char* message)
            : Nan::AsyncWorker(callback), priority(priority), message(message) {
            }
        ~Worker() {
            delete[] message;
        }

        void Execute() {
            if(message)
                syslog(priority, "%s", message);
        }

        void HandleOKCallback() {
            Nan::HandleScope scope;

            if(callback)
                callback->Call(0, NULL, async_resource);
        };

    private:
        int priority;
        char* message;
};

static char ident[1024];

// wrap: void openlog(const char *ident, int option, int facility);
NAN_METHOD(OpenLog) {

    const Nan::Utf8String arg0(info[0]);
    Local<Int32> arg1 = Nan::To<Int32>(info[1]).ToLocalChecked();
    Local<Int32> arg2 = Nan::To<Int32>(info[2]).ToLocalChecked();

    // openlog() requires ident be statically allocated.
    size_t length = arg0.length();
    if(length) {
      if(length > sizeof(ident)-1)
        length = sizeof(ident)-1;
      strncpy(ident, *arg0, length);
    }
    int option = arg1->Value();
    int facility = arg2->Value();

    openlog(ident, option, facility);

    return;
}

static char* dupBuf(const Local<Value>& arg) {
    const char* mem = node::Buffer::Data(arg);
    size_t memsz = node::Buffer::Length(arg);
    char* s = new char[memsz + 1];
    memcpy(s, mem, memsz);
    s[memsz] = 0;
    return s;
}

static char* dupStr(const Local<Value>& arg) {
    const Nan::Utf8String str(arg);
    const char* mem = *str;
    size_t memsz = str.length();
    char* s = new char[memsz + 1];
    memcpy(s, mem, memsz);
    s[memsz] = 0;
    return s;
}

// wrap: void syslog(int priority, const char *format, ...);
NAN_METHOD(SysLog) {

    Local<Int32> arg0 = Nan::To<Int32>(info[0]).ToLocalChecked();

    int priority = arg0->Value();
    char* message = NULL;
    Nan::Callback *callback = NULL;

    if(info[2]->IsFunction())
        callback = new Nan::Callback(info[2].As<Function>());

    if(node::Buffer::HasInstance(info[1])) {
        message = dupBuf(info[1]);
    } else {
        message = dupStr(info[1]);
    }

    if(message || callback) {
        Nan::AsyncQueueWorker(new Worker(callback, priority, message));
    }

    return;
}

// wrap: int setlogmask(int mask);
NAN_METHOD(SetLogMask) {

    Local<Int32> arg0 = Nan::To<Int32>(info[0]).ToLocalChecked();
    int mask = arg0->Value();
    int last = setlogmask(mask);

    info.GetReturnValue().Set(Nan::New<Number>(last));
}

// wrap: void closelog(void);
NAN_METHOD(CloseLog) {

    closelog();

    return;
}

NAN_MODULE_INIT(Init) {
    Nan::Export(target, "openlog", OpenLog);
    Nan::Export(target, "syslog", SysLog);
    Nan::Export(target, "setlogmask", SetLogMask);
    Nan::Export(target, "closelog", CloseLog);

    Local<Object> where = Nan::New<Object>();
#define DEFINE(N) Nan::Set(where, Nan::New<String>(#N).ToLocalChecked(), Nan::New<Number>(N))

    // option argument to openlog() is an OR of any of these:
    Nan::Set(target, Nan::New<String>("option").ToLocalChecked(), where = Nan::New<Object>());
    DEFINE(LOG_CONS);
    DEFINE(LOG_NDELAY);
    DEFINE(LOG_ODELAY);
#ifndef LOG_PERROR
// not defined on Solaris but we want the exported object to be consistent
#define LOG_PERROR 0x0 // no-op
#endif
    DEFINE(LOG_PERROR);
    DEFINE(LOG_PID);
    DEFINE(LOG_NOWAIT);

    // facility argument to openlog() is any ONE of these:
    Nan::Set(target, Nan::New<String>("facility").ToLocalChecked(), where = Nan::New<Object>());
    DEFINE(LOG_AUTH);
#ifdef LOG_AUTHPRIV
    DEFINE(LOG_AUTHPRIV);
#endif
    DEFINE(LOG_CRON);
    DEFINE(LOG_DAEMON);
#ifdef LOG_FTP
    DEFINE(LOG_FTP);
#endif
    DEFINE(LOG_KERN);
    DEFINE(LOG_LOCAL0);
    DEFINE(LOG_LOCAL1);
    DEFINE(LOG_LOCAL2);
    DEFINE(LOG_LOCAL3);
    DEFINE(LOG_LOCAL4);
    DEFINE(LOG_LOCAL5);
    DEFINE(LOG_LOCAL6);
    DEFINE(LOG_LOCAL7);
    DEFINE(LOG_LPR);
    DEFINE(LOG_MAIL);
    DEFINE(LOG_NEWS);
    DEFINE(LOG_SYSLOG);
    DEFINE(LOG_USER);
    DEFINE(LOG_UUCP);

    // priority argument to syslog() is an OR of a facility and ONE log level:
    Nan::Set(target, Nan::New<String>("level").ToLocalChecked(), where = Nan::New<Object>());
    DEFINE(LOG_EMERG);
    DEFINE(LOG_ALERT);
    DEFINE(LOG_CRIT);
    DEFINE(LOG_ERR);
    DEFINE(LOG_WARNING);
    DEFINE(LOG_NOTICE);
    DEFINE(LOG_INFO);
    DEFINE(LOG_DEBUG);
}
}

NODE_MODULE(core, Init);
