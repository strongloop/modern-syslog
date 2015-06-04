#include <node.h>
#include <nan.h>
#include <syslog.h>

using v8::Function;
using v8::FunctionTemplate;
using v8::Handle;
using v8::Local;
using v8::Null;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

namespace {

class Worker: public NanAsyncWorker {
    public:
        Worker(NanCallback *callback, int priority, char* message)
            : NanAsyncWorker(callback), priority(priority), message(message) {
            }
        ~Worker() {
            delete[] message;
        }

        void Execute() {
            syslog(priority, "%s", message);
        }

        void HandleOKCallback() {
            NanScope();

            if(!callback->IsEmpty())
                callback->Call(0, NULL);
        };

    private:
        int priority;
        char* message;
};

static char ident[1024];

// wrap: void openlog(const char *ident, int option, int facility);
NAN_METHOD(OpenLog) {
    NanScope();

    // openlog requires ident be statically allocated. Write doesn't guarantee
    // NULL-termination, so preserve last byte as NULL.
    args[0]->ToString()->WriteUtf8(ident, sizeof(ident)-1);
    int option = args[1]->ToInt32()->Value();
    int facility = args[2]->ToInt32()->Value();

    openlog(ident, option, facility);

    NanReturnUndefined();
}

static char* dupBuf(const Handle<Value>& arg) {
    const char* mem = node::Buffer::Data(arg);
    size_t memsz = node::Buffer::Length(arg);
    char* s = new char[memsz + 1];
    memcpy(s, mem, memsz);
    s[memsz] = 0;
    return s;
}

static char* dupStr(const Local<String>& m) {
    if(m.IsEmpty())
        return NULL;

    // Exact calculation of UTF length involves double traversal. Avoid this
    // because we know UTF8 expansion is < 4 bytes out per byte in.
    char* s = new char[m->Length() * 4];
    m->WriteUtf8(s);
    return s;
}

// wrap: void syslog(int priority, const char *format, ...);
NAN_METHOD(SysLog) {
    NanScope();

    int priority = args[0]->ToInt32()->Value();
    char* message = NULL;
    NanCallback *callback = new NanCallback(args[2].As<Function>());

    if(node::Buffer::HasInstance(args[1])) {
        message = dupBuf(args[1]);
    } else {
        message = dupStr(args[1]->ToString());
    }

    if (message) {
        NanAsyncQueueWorker(new Worker(callback, priority, message));
    } else if(!callback->IsEmpty()) {
        callback->Call(0, NULL);
    }

    NanReturnUndefined();
}

// wrap: int setlogmask(int mask);
NAN_METHOD(SetLogMask) {
    NanScope();

    int mask = args[0]->ToInt32()->Value();
    int last = setlogmask(mask);

    NanReturnValue(NanNew<Number>(last));
}

// wrap: void closelog(void);
NAN_METHOD(CloseLog) {
    NanScope();

    closelog();

    NanReturnUndefined();
}

void Init(Local<Object> exports) {
#define EXPORT(N, F) \
    exports->Set(NanNew<String>(N), \
            NanNew<FunctionTemplate>(F)->GetFunction())

    EXPORT("openlog", OpenLog);
    EXPORT("syslog", SysLog);
    EXPORT("setlogmask", SetLogMask);
    EXPORT("closelog", CloseLog);

    Local<Object> where = NanNew<Object>();
#define DEFINE(N) where->Set(NanNew<String>(#N), NanNew<Number>(N))

    // option argument to openlog() is an OR of any of these:
    exports->Set(NanNew<String>("option"), where = NanNew<Object>());
    DEFINE(LOG_CONS);
    DEFINE(LOG_NDELAY);
    DEFINE(LOG_ODELAY);
    DEFINE(LOG_PERROR);
    DEFINE(LOG_PID);
    DEFINE(LOG_NOWAIT);

    // facility argument to openlog() is any ONE of these:
    exports->Set(NanNew<String>("facility"), where = NanNew<Object>());
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
    exports->Set(NanNew<String>("level"), where = NanNew<Object>());
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
