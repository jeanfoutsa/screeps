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

const roleWorker = {

    /** 
	* Worker creep role function.
	* @param {Creep} creep - The creep with worker memory in the room.
	**/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
			creep.memory.sourceNr = undefined;
            creep.memory.working = false;
            creep.say('getting');
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('working');
        }
		
        if(creep.memory.working) 
		{
			// Look in the room
			const danger = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
			const tower = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => {return (s.structureType == STRUCTURE_TOWER) && s.energy + 150 < s.energyCapacity;}});
			const site = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
			const spawn = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: (s) => {return (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) && s.energy < s.energyCapacity;}});
			
			// Fill up towers missing energy in priority if danger
			if(tower && danger)
			{
				if(creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
				{
					creep.moveTo(tower);
				}
			}
			
			// Fill up spawns or extensions missing energy			
            if(spawn) 
			{
                if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
				{
                    creep.moveTo(spawn);
                }
            }
			else 
			{
				// Build closest construction
				if(site) 
				{
					tasks.construct(creep,site);
				}
				// Fill up tower missing energy
				else 
				{
					if(tower) 
					{
						if(creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) 
						{
							creep.moveTo(tower);
						}
					}
					// Upgrade controller
					else 
					{
						if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) 
						{
							creep.moveTo(creep.room.controller);
						}
					}
				}
			}
        }
        else 
		{
			if(creep.ticksToLive < 100){
				creep.memory.role = 'recycler';
			}
			else {
				tasks.gogetNRG(creep);
			}
        }
    }
};

module.exports = roleWorker;