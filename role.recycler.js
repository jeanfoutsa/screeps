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

const roleRecycler = {
	
    /** 
	* Recycler creep role function.
	* @param {Creep} creep - The creep with recycler memory. Recycle creep before dying.
	**/
	run : function(creep){
		if(creep.memory.homeRoom == undefined || creep.room.name == creep.memory.homeRoom ){
			const spawn = creep.room.find(FIND_STRUCTURES,
				{filter : (s) => s.structureType == STRUCTURE_SPAWN})[0];
			tasks.recycle(creep,spawn);
		}
		else{
			creep.moveTo(Game.rooms[creep.memory.homeRoom].find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_SPAWN })[0]);
		}
	}
};

module.exports = roleRecycler;