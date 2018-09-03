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

const roleHarvester = {

    /** 
	* Harvester creep role function.
	* @param {Creep} creep - The creep with harvester memory in the room. Mine energy at sources.
	**/
    run: function(creep) 
	{
		//only if two sources and two harvesters
		if (creep.memory.harvest != 0 && creep.memory.harvest != 1)
		{
			const harvesters = creep.room.find(FIND_MY_CREEPS,{filter: (c) => c.memory.role == 'harvester'});
			if(harvesters.length && harvesters[0].memory.harvest == 1){
				creep.memory.harvest = 0;
			}
			else{
				creep.memory.harvest = 1;
			}
		}
		
		const mySource = creep.room.find(FIND_SOURCES)[creep.memory.harvest];
		const myContainer = mySource.pos.findInRange(FIND_STRUCTURES,1,{filter:(s) => s.structureType == STRUCTURE_CONTAINER})[0];
		const myDropped = mySource.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
		const myEnergy = (( myContainer != undefined ? myContainer.store.energy : 0 ) + ( myDropped != undefined ? myDropped.amount : 0 ));
		 
		// Build container if no container near the source
		if(myContainer == undefined)
		{
			const csContainer = mySource.pos.findInRange(FIND_CONSTRUCTION_SITES,1,{filter:(s) => s.structureType == STRUCTURE_CONTAINER});
			if(csContainer.length == 0)
			{
                creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
			}
			tasks.construct(creep,csContainer[0]);
		}
		// Repair container if damaged
		else if(myContainer.hits + 100 < myContainer.hitsMax)
		{
			creep.repair(myContainer);
		}
		
		//prevent overmining and invaders early game, need rework
		if (myEnergy < 2000)
		{
			tasks.mine(creep,mySource);
		}
    }
};

module.exports = roleHarvester;