# Testing Report TeraMotors PHASE ONE   
  
* Missing translation on landing.tsx  
* Missing translations in /marketing/page.tsx  
* /marketing/page.tsx logo redirects to the companies landing.tsx  
*  Login for missing translation  
* Forget password page need modernisation plus translations  
*  /register needs full translations   
* /register needs to directly sing the user in and redirect to /dashboard not /login and tell him to login plus it should start the onboarding tour.   
* Signing in to termaotors-default tenet shows  *// Generate navigation tiles* line 186 on /dashboard/page.tsx but when signing in to any other new tenet these tiles do not show   
* Notifications are not real ad are annoying they should be limited and fixed to work with the real sockets status.  
* Onboarding/tour needs translations. Modernisations and more steps added plus the tasks list added after tour.   
* All /settings tab needs translations and RTL Fixations.  
* /settings/user manegmeent loads normally with all users for the main default tenet “Teramotors-default” but not for other tenets.   
* All settings connected apis are not tested Ai should test all the fields apis and make sure editing add and removing in the settings for all tabs are working.    
* All /reports subs ages are working perfectly with real data but all of them including the /report/page.tsx needs translations and RTL layout.  
* /WhatsApp/page.tsx needs editing to ensure consistency ultramsg account should be created and tested all automatically configured messages apis should be tested by ai.   
* All message logs in /whatsapp should be hard deleted from the db and ensure that tenet based migrations are working and no data leaks to other tenets.   
* All /dashboard pages and their tables CRUD pages etc needs translations either hardcoded strings or missing translations in common/ files exists.  
*  Creating and editing customers works but does not reflect on the table nor the view page.  
* Vehicles page isn’t using the @responsiveVihiclesTable.tsx it should be using it for consistency.   
* Vehicles page and CRUD will be tested later.  
* QuickCreateCustomer,Vehicle,Part,Sevice al should be modernised and translated.   
* Createjobcard job card type google on the header needs modernisation and the one in the main details sections should be removed.   
*   
* [Regular type] Job car and invoice creation , job card creation, jobcartd and estimate creating are all broken:  
  
```
 DB connection verified
 ⨯ Error: JobCard validation failed: jobCardNumber: Path `jobCardNumber` is required.
    at ValidationError.inspect (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/error/validation.js:52:26)
    at formatValue (node:internal/util/inspect:1148:19)
    at inspect (node:internal/util/inspect:409:10)
    at formatWithOptionsInternal (node:internal/util/inspect:2897:40)
    at formatWithOptions (node:internal/util/inspect:2759:10)
    at console.value (node:internal/console/constructor:377:14)
    at console.error (node:internal/console/constructor:444:61)
    at prefixedLog (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/build/output/log.js:80:31)
    at Object.error (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/build/output/log.js:90:5)
    at doRender (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1412:30)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async cacheEntry.responseCache.get.routeKind (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1599:28)
    at async DevServer.renderToResponseWithComponentsImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1507:28)
    at async DevServer.renderPageComponent (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1962:32)
    at async DevServer.pipeImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:920:25)
    at async NextNodeServer.handleCatchallRenderRequest (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/next-server.js:272:17)
    at async DevServer.handleRequestImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:816:17)
    at async /Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/dev/next-dev-server.js:339:20
    at async Span.traceAsyncFn (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/trace/trace.js:154:20)
    at async DevServer.handleRequest (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/dev/next-dev-server.js:336:24)
    at async invokeRender (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/router-server.js:174:21)
    at async handleRequest (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/router-server.js:353:24)
    at async requestHandlerImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/router-server.js:377:13)
    at async Server.requestListener (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/start-server.js:141:13) {
  errors: {
    jobCardNumber: ValidatorError: Path `jobCardNumber` is required.
        at validate (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/schemaType.js:1413:13)
        at SchemaType.doValidate (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/schemaType.js:1397:7)
        at /Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/document.js:3111:18
        at process.processTicksAndRejections (node:internal/process/task_queues:84:11) {
      properties: [Object],
      kind: 'required',
      path: 'jobCardNumber',
      value: undefined,
      reason: undefined,
      Symbol(mongoose#validatorError): true
    }
  },
  _message: 'JobCard validation failed'
}
 POST /api/job-cards 500 in 810ms
DB connection verified
DB connection verified
 ⨯ Error: JobCard validation failed: jobCardNumber: Path `jobCardNumber` is required.
    at ValidationError.inspect (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/error/validation.js:52:26)
    at formatValue (node:internal/util/inspect:1148:19)
    at inspect (node:internal/util/inspect:409:10)
    at formatWithOptionsInternal (node:internal/util/inspect:2897:40)
    at formatWithOptions (node:internal/util/inspect:2759:10)
    at console.value (node:internal/console/constructor:377:14)
    at console.error (node:internal/console/constructor:444:61)
    at prefixedLog (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/build/output/log.js:80:31)
    at Object.error (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/build/output/log.js:90:5)
    at doRender (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1412:30)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
    at async cacheEntry.responseCache.get.routeKind (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1599:28)
    at async DevServer.renderToResponseWithComponentsImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1507:28)
    at async DevServer.renderPageComponent (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1924:24)
    at async DevServer.renderToResponseImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:1962:32)
    at async DevServer.pipeImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:920:25)
    at async NextNodeServer.handleCatchallRenderRequest (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/next-server.js:272:17)
    at async DevServer.handleRequestImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/base-server.js:816:17)
    at async /Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/dev/next-dev-server.js:339:20
    at async Span.traceAsyncFn (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/trace/trace.js:154:20)
    at async DevServer.handleRequest (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/dev/next-dev-server.js:336:24)
    at async invokeRender (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/router-server.js:174:21)
    at async handleRequest (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/router-server.js:353:24)
    at async requestHandlerImpl (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/router-server.js:377:13)
    at async Server.requestListener (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/next/dist/server/lib/start-server.js:141:13) {
  errors: {
    jobCardNumber: ValidatorError: Path `jobCardNumber` is required.
        at validate (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/schemaType.js:1413:13)
        at SchemaType.doValidate (/Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/schemaType.js:1397:7)
        at /Users/almonzerfadl/Desktop/Work/Programming/teramotors/client/node_modules/mongoose/lib/document.js:3111:18
        at process.processTicksAndRejections (node:internal/process/task_queues:84:11) {
      properties: [Object],
      kind: 'required',
      path: 'jobCardNumber',
      value: undefined,
      reason: undefined,
      Symbol(mongoose#validatorError): true
    }
  },
  _message: 'JobCard validation failed'
}
 POST /api/job-cards 500 in 776ms

```
