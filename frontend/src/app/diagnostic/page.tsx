'use client';
import { useState, useEffect } from 'react';

export default function DiagnosticPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const print = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
  };

  const runDiagnostics = async () => {
    setLogs([]);
    print('--- TASK 2: Instrument EVERYTHING ---');
    
    // @ts-ignore
    const midnight = window.midnight;
    print(`window.midnight: ${typeof midnight}`);
    
    if (!midnight) {
       print('window.midnight is undefined');
       return;
    }

    print(`Object.keys(window.midnight): ${JSON.stringify(Object.keys(midnight))}`);
    print(`Reflect.ownKeys(window.midnight): ${JSON.stringify(Reflect.ownKeys(midnight).map(k => String(k)))}`);

    const keys = Object.keys(midnight);
    for (const key of keys) {
      print(`\n--- Inspecting window.midnight["${key}"] ---`);
      const obj = midnight[key];
      
      print(`typeof obj: ${typeof obj}`);
      if (typeof obj !== 'object' || !obj) continue;

      print(`constructor.name: ${obj.constructor?.name}`);
      const proto = Object.getPrototypeOf(obj);
      print(`prototype: ${proto?.constructor?.name}`);
      
      if (proto) {
        print(`prototype keys: ${JSON.stringify(Object.keys(proto))}`);
        print(`Object.getOwnPropertyNames(proto): ${JSON.stringify(Object.getOwnPropertyNames(proto))}`);
        print(`Reflect.ownKeys(proto): ${JSON.stringify(Reflect.ownKeys(proto).map(k => String(k)))}`);
      }

      print(`own keys: ${JSON.stringify(Object.keys(obj))}`);
      print(`Object.getOwnPropertyNames(obj): ${JSON.stringify(Object.getOwnPropertyNames(obj))}`);

      // Loop own and proto properties
      const allProps = new Set([...Object.getOwnPropertyNames(obj)]);
      if (proto) {
        Object.getOwnPropertyNames(proto).forEach(p => allProps.add(p));
      }

      for (const prop of Array.from(allProps)) {
        let val;
        let typeofVal = 'unknown';
        let desc;
        try {
          val = (obj as any)[prop];
          typeofVal = typeof val;
          desc = Object.getOwnPropertyDescriptor(obj, prop) || Object.getOwnPropertyDescriptor(proto, prop);
        } catch(e: any) {
          typeofVal = `error: ${e.message}`;
        }
        
        let valStr = String(val);
        if (typeofVal === 'function') valStr = '[Function]';
        if (typeofVal === 'object') valStr = '[Object]';
        print(`  - prop [${prop}] typeof: ${typeofVal} | descriptor: ${desc ? Object.keys(desc).join(',') : 'none'}`);
        if (typeofVal !== 'function' && typeofVal !== 'object') {
           print(`    value: ${valStr}`);
        }
      }

      print(`toString(): ${(obj as any).toString()}`);

      print('\n--- TASK 3: Wrap every function ---');
      const methodsToWrap = Array.from(allProps).filter(p => {
        try { return typeof (obj as any)[p] === 'function'; } catch { return false; }
      });

      for (const method of methodsToWrap) {
        const original = (obj as any)[method];
        print(`Wrapping method: ${method}()`);
        
        // Don't overwrite properties if they are read-only or getters
        const desc = Object.getOwnPropertyDescriptor(obj, method) || (proto && Object.getOwnPropertyDescriptor(proto, method));
        if (desc && !desc.writable && !desc.set) {
           print(`  Skipped wrapping ${method} because it is read-only.`);
           continue;
        }

        try {
           (obj as any)[method] = function (...args: any[]) {
             print(`[TRACE] Called ${method}()`);
             print(`[TRACE]   arguments: ${JSON.stringify(args)}`);
             print(`[TRACE]   typeof arguments: ${args.map(a => typeof a).join(', ')}`);
             
             let result;
             try {
               result = original.apply(this, args);
             } catch (err: any) {
               print(`[TRACE]   ${method}() threw synchronously: ${err.message}`);
               console.error(err);
               throw err;
             }

             if (result && typeof result.then === 'function') {
               print(`[TRACE]   returned promise`);
               return result.then((res: any) => {
                 print(`[TRACE]   ${method}() resolved with: ${JSON.stringify(res)}`);
                 return res;
               }).catch((err: any) => {
                 print(`[TRACE]   ${method}() rejected with: ${err.message || err}`);
                 console.error(err);
                 throw err;
               });
             } else {
               print(`[TRACE]   returned synchronously: ${JSON.stringify(result)}`);
               return result;
             }
           };
        } catch(e:any) {
           print(`  Failed to wrap ${method}: ${e.message}`);
        }
      }

      print('\n--- Testing connect() on wrapped object ---');
      try {
        if (typeof (obj as any).connect === 'function') {
           print(`Calling obj.connect()...`);
           await (obj as any).connect();
           print(`obj.connect() success!`);
        } else {
           print(`obj.connect is not a function`);
        }
      } catch (err: any) {
        print(`obj.connect() failed: ${err.message}`);
      }
    }
  };

  return (
    <div className="p-8 font-mono text-sm max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Midnight Diagnostic Page</h1>
      <button 
        onClick={runDiagnostics}
        className="px-4 py-2 bg-blue-600 text-white rounded mb-8"
      >
        Run Diagnostics & Trace
      </button>
      
      <div className="bg-black text-green-400 p-4 rounded overflow-auto h-[600px] whitespace-pre-wrap">
        {logs.length === 0 ? 'Click button to start...' : logs.join('\n')}
      </div>
    </div>
  );
}
