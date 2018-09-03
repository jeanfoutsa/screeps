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

const tasks = require('tasks');

const roleRemguard = {

    /** 
	* Remote guard creep role function.
	* @param {Creep} creep - The creep with remote guard memory. Protect distant room.
	**/
    run: function(creep) {		
		if(creep.room.name == Game.flags[creep.memory.myflag].pos.roomName){
			const danger = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
			if(creep.attack(danger) == ERR_NOT_IN_RANGE) {
				creep.moveTo(danger);
			}		
			else {
				if(creep.ticksToLive < 1400 && danger == undefined) {
						creep.memory.role = 'recycler';
				}
			}
		}
		else {
			const thisflag = Game.flags[creep.memory.myflag];
			tasks.gototarget(creep,thisflag);
		}
	}
};

module.exports = roleRemguard;