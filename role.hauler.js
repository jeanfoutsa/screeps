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

const roleHauler = {

    /** 
	* Hauler creep role function.
	* @param {Creep} creep - The creep with hauler memory in the room. Transport energy from container to spawn.
	**/
    run: function(creep) {
		
        if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.sourceNr = undefined;
            creep.memory.working = false;
            //creep.say('getting');
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            //creep.say('giving');
        }

        if(creep.memory.working) {
			const prioritylist=[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER,STRUCTURE_STORAGE];
			tasks.giveNRG(creep,prioritylist);
        }
        else {
			if(creep.ticksToLive < 100){
				creep.memory.role = 'recycler';
			}
			else {
				const spawn = creep.room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN})[0];
				const dropped = spawn.pos.findInRange(FIND_DROPPED_RESOURCES,1); //energy dropped from recycling
				if(dropped.length){
					tasks.pick(creep,dropped[0]);
				}
				else{
					//go get NRG in priority: dropped, container, storage, harvest
					tasks.gogetNRG(creep);
				}				
			}
        }
    }
};

module.exports = roleHauler;