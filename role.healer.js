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

const roleHealer = {

    /** 
	* Healer creep role function.
	* @param {Creep} creep - The creep with healer memory.
	**/
	run : function(creep){
        let myflag = Game.flags[creep.memory.myflag];
        if(myflag == undefined){
            myflag = Game.flags['kill'];
        }
        const damaged = _.sortBy(creep.pos.findInRange(FIND_MY_CREEPS,1,{filter: (c) => c.hits < c.hitsMax}),'hits');
        if(damaged.length){
            creep.heal(damaged[0]);
        }
        else{
            const damagedAtRange = _.sortBy(creep.pos.findInRange(FIND_MY_CREEPS,3,{filter: (c) => c.hits < c.hitsMax}),'hits');
            if(damagedAtRange.length){
                creep.rangedHeal(damagedAtRange[0]);
            }
        }
        if(creep.room.name==myflag.pos.roomName){
			const towers = creep.room.find(FIND_STRUCTURES, {
						filter: (structure) => {
						return (structure.structureType == STRUCTURE_TOWER) && structure.energy > 0;
						}
			});
			if (towers.length){
				creep.moveTo(Game.rooms[creep.memory.homeRoom]);
			}
			else {
				const closestKiller = creep.pos.findClosestByRange(FIND_MY_CREEPS,{filter: (c) => (c.memory.role == 'killer' || c.memory.role == 'guard')});
				if(closestKiller != undefined){
					creep.moveTo(closestKiller,{reusePath:0});
				}
				else{
					creep.moveTo(myflag,{reusePath:0});
				}
			}
        }
        else{
            const wayPoint = Game.flags[creep.memory.waypoint];
            if(wayPoint != undefined){
                if(creep.room.name == wayPoint.pos.roomName){
                    creep.memory.waypoint = undefined;
                }
                creep.moveTo(wayPoint);
            }
            else{
                tasks.gototarget(creep,myflag);
            }
        }
    }
};

module.exports = roleHealer;