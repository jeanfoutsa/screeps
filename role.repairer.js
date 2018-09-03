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

const roleRepairer = {

    /** 
	* Repairer creep role function.
	* @param {Creep} creep - The creep with repairer memory. Repair damaged structures.
	**/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.sourceNr = undefined;
            creep.memory.working = false;
            creep.say('getting');
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('repairing');
        }
		/** Repair all except walls and remparts **/
        if(creep.memory.working) {
			const targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType != STRUCTURE_WALL && 
				structure.structureType != STRUCTURE_RAMPART &&
				structure.hits + 500 < structure.hitsMax
			});
            if(targets.length) {
				const target = creep.pos.findClosestByRange(targets);
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
			else {
                if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
					creep.moveTo(creep.room.controller);
				}
            }
        }
        else {
			if(creep.ticksToLive < 100){
				creep.memory.role = 'recycler';
			}
			else {
				//go get NRG in priority: dropped, container, storage, harvest
				tasks.gogetNRG(creep);
			}
        }
    }
};

module.exports = roleRepairer;