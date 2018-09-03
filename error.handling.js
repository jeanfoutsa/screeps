// @formatter:off

/**
//
// _________________________________________________________
//                                          ___              
//            |\ |   |   |    |_/    |_|   |   |             
//            | \|   |___|    | |     |    |___|             
//                                                          
//______________________ Screeps AI ________________________
//
//
//
**/

// Code should be executed in "strict mode" as it make it easier to write "secure" JavaScript.
"use strict";

// @formatter:on


const errorHandling = {
	
    /** Handle errors **/
    print: function(error) {
        if (error.stack) error = error.stack;
        console.log(error);
        Game.notify(error);
    }
};

module.exports = errorHandling;