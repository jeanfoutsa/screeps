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

const roleRemharvester = {

    /** 
	* Remote harvester creep role function.
	* @param {Creep} creep - The creep with remote harvester memory. Mine distant room.
	**/
	run : function(creep){
		
        if(creep.memory.workable && creep.carry.energy == 0) {
            creep.memory.workable = false;
	    }
	    if(!creep.memory.workable && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.workable = true;
	    }		
		
        const thisflag = Game.flags[creep.memory.myflag];

		if(thisflag.pos.roomName in Game.rooms) //check to prevent breaking from no vision
		{
			const mySource = thisflag.pos.lookFor(LOOK_SOURCES)[0];
			
			if(creep.room.name == thisflag.pos.roomName){
				if(creep.memory.workable){
					const myContainer = thisflag.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
					if(myContainer == undefined){
						const csContainer = thisflag.pos.findInRange(FIND_CONSTRUCTION_SITES,1,{filter:(s) => s.structureType == STRUCTURE_CONTAINER});
						if(csContainer.length == 0){
						creep.pos.createConstructionSite(STRUCTURE_CONTAINER);
						}
						tasks.construct(creep,csContainer[0]);
					}
					else if(myContainer.hits < myContainer.hitsMax){
						creep.repair(myContainer);
					}
					else {
						tasks.mine(creep,mySource);
					}
				}
				else {
					tasks.mine(creep,mySource);					
				}
			}
			else tasks.gototarget(creep,thisflag);
		}
		else tasks.gototarget(creep,thisflag);
    }
};

module.exports = roleRemharvester;