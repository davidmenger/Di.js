# DI.js

----------------------

This is a simple dependency manager and a service container. It's usefull when:

1. You need run code in right order to prevent accesing undefined dependencies
2. You need to access  

## Service definition

Syntax is simple: `DI(<service name>, <service factory>[, <run now>]);`

- **service name** (String): Name of service
- **service factory** (function()): Function callback which returns an service
- **run now** (boolean): when is true, service factory is executed when all dependencies are resolved

Definition of `Bar` service

		DI("Bar", function(){
		    return "bar"
		});		
		
All services are loaded lazily

## Service access

Service is accessable via `DI.get(<service name>);` like in this example:

		DI.get("Bar"); // returns "bar"
		
Service is resolved only once on demand.

## Dependencies resolving

A service is resolved when all dependencies are met. Service dependencies are defined with parameters this way: 

		/**
		 *	this definition is executed when the Bar service became available
		 */
		DI("Foo", function(Bar){
		    // Bar === "bar"
		}, true);
		
		/**
		 * 
		 */
		DI("Bar", function(){
		    return "bar"
		});
