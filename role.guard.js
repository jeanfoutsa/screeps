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

const roleGuard = {

    /** 
	* Guard creep role function.
	* @param {Creep} creep - The creep with guard memory. Spawn when enemies detected.
	**/
    run: function(creep) {

		const danger = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
		const enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS,13);
		const enemy = creep.pos.findClosestByPath(enemies);

		if(creep.memory.working && enemy == undefined) {
			creep.memory.working = false;
		}
		if(!creep.memory.working && enemy != undefined) {
			creep.memory.working = true;
		}
		
		if (creep.memory.working){
			if (creep.attack(enemy) == ERR_NOT_IN_RANGE) {
				creep.moveTo(enemy);
			}
		}
		else {
			if(creep.ticksToLive < 1450 && danger == undefined) {
				creep.memory.role = 'recycler';
			}
			else {
				creep.moveTo(new RoomPosition(24,22,creep.memory.homeRoom));
			}
		}
    }
};

module.exports = roleGuard;