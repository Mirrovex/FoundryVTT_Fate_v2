export const _getInitiativeFormula = function() {
    const actor = this.actor;
    if ( !actor ) return "1d12";
    const actorData = actor.data.data;
  
    // Construct initiative formula parts
    const parts = [
      "1d12",
      actorData.inicjatywa.value
    ];
    
    return parts.filter(p => p !== null).join(" + ");
  };