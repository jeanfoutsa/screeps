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

const roleConqueror = {
	
    /** 
	* Conqueror creep role function.
	* @param {Creep} creep - The creep with conqueror memory.
	**/
	run : function(creep){
		
		const myflag = Game.flags[creep.memory.myflag];
		
		if(myflag == undefined) creep.memory.role = 'recycler';
		
		if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('getting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }

		if(creep.memory.upgrading){
			if(creep.room.name == myflag.pos.roomName){
				if(creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE){
					creep.moveTo(creep.room.controller);
				}
			}
			else{
				tasks.gototarget(creep,myflag);
			}
		}
		else{
			if(creep.room.name == myflag.pos.roomName){
				const spawns = creep.room.find(FIND_MY_STRUCTURES, {filter : (s) => s.structureType == STRUCTURE_SPAWN});
				if(!spawns.length){
					Game.flags['placespawn'].pos.createConstructionSite(STRUCTURE_SPAWN);
				}
				creep.memory.role = 'worker';
			}
			else{
				tasks.gogetNRG(creep);
			}
		}
	}
};

module.exports = roleConqueror;