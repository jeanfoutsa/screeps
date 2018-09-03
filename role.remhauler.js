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

const roleRemhauler = {

    /** 
	* Remote hauler creep role function.
	* @param {Creep} creep - The creep with remote hauler memory. Transport energy from distant room.
	**/
    run: function(creep) {
		
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('getting');
        }
        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('giving');
        }		
		
		if(creep.ticksToLive < 200 || creep.hits < creep.hitsMax){
			creep.memory.role = 'recycler';
			return;
		}
		
		const thisflag = Game.flags[creep.memory.myflag];
		
		if(thisflag.pos.roomName in Game.rooms) //check to prevent breaking from no vision
		{
			const dropped = thisflag.pos.findInRange(FIND_DROPPED_RESOURCES,3);
			const myContainer = thisflag.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];			
			
		if(creep.room.name != creep.memory.homeRoom)
		{
			const roadatpoint = creep.pos.findInRange(FIND_STRUCTURES,0,{filter: (s) => s.structureType == STRUCTURE_ROAD});
			
			if(creep.memory.working) 
			{
				const target = creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3,{filter : (s) => s.structureType == STRUCTURE_ROAD})[0];
				if (target != undefined){
					if(creep.build(target) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				}
				else{
                    if( _.filter(roadatpoint, (s) => s.hits < s.hitsMax).length){
	                   creep.repair(roadatpoint[0]);
				    }
                    if(Game.rooms[creep.memory.homeRoom].storage != undefined){
                        creep.moveTo(Game.rooms[creep.memory.homeRoom].storage);
                    }
					else{
                        creep.moveTo(new RoomPosition(25,25,creep.memory.homeRoom));
                    }
				}
			}
			else if(creep.room.name == thisflag.pos.roomName){
                if (myContainer != undefined && myContainer.store.energy == myContainer.storeCapacity){ //fixes container overflowing
					if(creep.withdraw(myContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(myContainer);
					}
				}
        		else if (dropped.length){
					tasks.pick(creep,dropped[0]);
        		}
        		else{
					if(myContainer != undefined && myContainer.store.energy > 0){
						tasks.takeNRG(creep,myContainer);
					}
        		}
			}
            else{
				tasks.gototarget(creep,thisflag);
            }
		}
		else if (creep.room.name == creep.memory.homeRoom)
		{
			if (creep.memory.working)
			{
				const prioritylist=[STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER,STRUCTURE_STORAGE];
				tasks.giveNRG(creep,prioritylist);
			}
			else if(creep.ticksToLive < 200 || creep.hits < creep.hitsMax){
				creep.memory.role = 'recycler';
			}
			else{
				tasks.gototarget(creep,thisflag);
			}
		}
		}
		else tasks.gototarget(creep,thisflag);
	}
};

module.exports = roleRemhauler;