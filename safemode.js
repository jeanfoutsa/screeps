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

const safemode = {
	
    /** Safe mode function **/
	run: function(thisroom) {
		
		// Exit if safemode active
		if (thisroom.controller.safeMode) return;
		
		// Look for towers, enemies and walls in the room
		const towers = thisroom.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
		const enemies = thisroom.find(FIND_HOSTILE_CREEPS);		
		const walls = thisroom.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
		
		// Define activation flag
		let activate = 0;
		
		if (enemies.length > 0)
		{
			if (towers.length > 0)
			{
				for (let wall of walls) 
				{
					// Set activation flag if room has active tower and under attack and wall is falling
					if (wall.hits <= 1000) 
					{						
						activate = 1;
						break;
					}
				}
			}
			// Set activation flag if room has no active tower and under attack
			else
			{				
				activate = 1;
			}
		}
		
		// Activate safe mode based on activation flag
		if (activate > 0)
		{
			if(thisroom.controller.safeMode == undefined || !thisroom.controller.safeMode)
			{				
				thisroom.controller.activateSafeMode();
				return;
			}
		}
    }
};

module.exports = safemode;