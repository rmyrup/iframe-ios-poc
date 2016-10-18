/* global mhe*/
/*jshint unused:false*/

var caliperDebug = false;

// send for general navigation event
function sendCaliperNavigationEvent(){

  if(caliperDebug){
    console.log("---------------------------------");
    console.log("******* got navigation event *********");
    console.log("---------------------------------");
  }

  mhe.caliper({type:'NavigationEvent', action:'NavigatedTo' });
}


// send on last submitted attempt / both correct or incorrect
function sendCaliperEventsOnLastAttempt(p_Answer,p_Hintcode){

  if(caliperDebug){
    console.log("---------------------------------");
    console.log("******* final caliper event sent on last attempt *******");
    console.log("hint code was " + p_Hintcode);
    console.log("answer object was ");
    console.dir(p_Answer);
    console.log("---------------------------------");
  }

  mhe.caliper({type:'AssessmentItemEvent', answer:p_Answer, action:'Completed'});
  mhe.caliper({type:'OutcomeEvent', action:'Graded', hint:p_Hintcode });
  mhe.caliper( { type: 'AssessmentEvent', action:'Submitted' } );
}

// use to test placement of final event
function testCaliperPlacement(p_status){
  console.log("The message sent was " + p_status );
}






