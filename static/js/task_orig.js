/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you
var bonusResponse="default";
var bonusAmount=0;
// All pages to be loaded
var pages = [
    "instructions/instruct-1.html",
    "instructions/instruct-2.html",
    "instructions/instruct-3.html",
    "instructions/instruct-ready.html",
    "stage.html",
    "BonusStage.html",
    "postquestionnaire.html"
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
    "instructions/instruct-1.html",
    "instructions/instruct-2.html",
    "instructions/instruct-3.html",
    "instructions/instruct-ready.html"
];


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested 
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and 
* insert them into the document.
*
********************/



var guillaume = function() {
    //Things to figure out
    
    
    //Lines 163-172 are useless right now but may want to keep in future
    //var idN = [];
    
    //for (var i=1;i<=3;i++){
    //idN.push(i);
    //}
    
    //var delayN=[3,4,5];	
    
    //var stims = {id: idN,delay:delayN};
    
    //Hard coded for now. First number is id, second number is delay i.e. [id, delay]. Delay units are 500 ms.
    //First three trials in line 186 are practice trials
    //Because the bonus trial is hard coded to [2,4] MAKE SURE THERE'S ONLY ONE [2,4] TRIAL
    //[7,4] and [8,13] are catch trials. Should always gamble on id 7 and never gamble on id 8
    
    var stims=[
    [1,4],[1,12],[2,4],[2,12],[3,12],[3,4],[4,12],[4,4],[5,12],[5,4],[6,12],[6,4],[5,0],[5,0],[6,0],[6,0],
    [1,0],[2,0],[3,0],[4,0],
    [1,5],[1,11],[2,5],[2,11],[3,11],[3,5],[4,11],[4,5],[5,11],[5,5],[6,11],[6,5],[5,0],[5,0],[6,0],[6,0],
    [1,0],[2,0],[3,0],[4,0],
    [1,4],[1,12],[2,5],[2,12],[3,12],[3,4],[4,12],[4,4],[5,12],[5,4],[6,12],[6,4],[5,0],[5,0],[6,0],[6,0],
    [1,0],[2,0],[3,0],[4,0],
    [1,5],[1,11],[2,5],[2,11],[3,11],[3,5],[4,11],[4,5],[5,11],[5,5],[6,11],[6,5],[5,0],[5,0],[6,0],[6,0],
    [1,0],[2,0],[3,0],[4,0],
    //[2,4],
    [7,4],[8,13]
    ];
    
    var stims=_.shuffle(stims);
    stims.unshift([1,0],[2,12],[1,0]);	
    
    var listening=false;
    var listeningG=false;
    var counter = 0;
    var start=0;
    var pausewhere=0; //like delay, but calculates the when the progress bar should pause as a percent of trial duration
    var progduration=0; //amount of time to advance the progress bar
    var doprogress=1; // toggle indicating which stage of progress bar advancement
    //Variables to track
    var trialNumber=0;
    var response=null;
    var gambleMag=null;
    var gambleDelay=null;
    var currentTrial=null;
    //RT variables
    var gambleStim=null;
    var gambleRT=null;
    var outcomeStim=null;
    var outcomeRT=null;
    var listeningF=false;
    var practiceTrials=3;
    
    //This is what decides whether to end experiment or move on to next trial.
    var next = function() {
	if (stims.length===0) {
	    psiTurk.recordTrialData({"trialNumber":trialNumber, "standardGamble":gambleMag,"gambleInt":gambleDelay, "response":response,"gambleRT":gambleRT, "outcomeRT":outcomeRT});
	    expFinish();
	}	
	else {
	    if(practiceTrials==-1){
		psiTurk.recordTrialData({"trialNumber":trialNumber, "standardGamble":gambleMag,"gambleInt":gambleDelay, "response":response,"gambleRT":gambleRT, "outcomeRT":outcomeRT});
		console.log("Just tracked data")
		//console.log("trialNumber: "+trialNumber+ "  standardGamble: "+gambleMag+"  gambleInt: "+gambleDelay+ "  response: "+response+" gambleRT:  "+gambleRT+" outcomeRT:  "+outcomeRT);
		var img = document.createElement("img");
		var src = document.getElementById("stim");
		src.innerHTML="";
		src.appendChild(img);
		currentTrial = stims.shift();
		delay = currentTrial[1];
		trialNumber++;
		trial();
	    }
	    //This only happens at start of real experiment, initating trial number one
	    else if(practiceTrials==0){
		console.log("About to start real experiment")
		practiceTrials--;
		var img = document.createElement("img");
		var src = document.getElementById("stim");
		img.src = "/static/images/endPractice.png";
		src.innerHTML="";
		src.appendChild(img);
		currentTrial = stims.shift();
		delay=currentTrial[1];
		setTimeout(trial,1500);
	    }
	    else{
		console.log("You have "+practiceTrials+" practice trials remaining")
		// console.log("Put in slide indicating practice trial")                                                                                            
                practiceTrials--;                                                                                                                                
                var img = document.createElement("img");                                                                                                         
                img.src = "/static/images/practiceTrial.png";                                                                                                    
                var src = document.getElementById("stim");                                                                                                       
                src.innerHTML="";                                                                                                                                
                src.appendChild(img);                                                                                                                            
                currentTrial = stims.shift();                                                                                                                    
                delay=currentTrial[1];                                                                                                                           
                setTimeout(trial,1500); 
	    }
	}
    };
    //This is what tracks their decision for the end
    //Right now, hard coded for the [2,4] trial so that every bonus trial is just the [2,4] trial
    
    
    //This is what starts each trial. Consider it the 'driver'
    var trial=function(){
	
	console.log("trial function initialized");
	//console.log("There are "+stims.length+" trials left");
	start=1;
	gambleMag=currentTrial[0];
	gambleDelay=(currentTrial[1])/2;	
	counter=0;
	
	var img = document.createElement("img");
	img.src = "/static/images/TrialStart"+currentTrial[0]+".png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	listening=true;
	doprogress = 1; // defining when to advance the progress bar: (1:ON,2:OFF) for NoGamble, (1:ON,2:OFF,3:ON) for Gamble
	pausewhere = 13 / 13 * 100;
	progduration = 13 * 500;

	window.onkeyup = function(e) {
	    var key = e.keyCode ? e.keyCode : e.which;
	    if(key==32 && delay==0 && listening==true){
		listening=false;
		setTimeout(progressBarLoopNoGamble,500)
	    }
	    else if(key==32 && delay != 0&&listening==true){
		pausewhere = delay / 13 * 100;
		progduration = delay * 500;
		setTimeout(progressBarLoopGamble,500)
	    }
	    //Shortcut: Press q to skip to end
	    else if(key==81&&listening==true){
		expFinish();
	    }
	}
    };
    
    //This is function that drives progress bar images
    progressBar=function(){
	var src = document.getElementById("stim");
	src.innerHTML="";
	var barb = document.getElementById("myBar");
	barb.style.backgroundColor = "Gainsboro";
	barb.style.width = 100 + '%';
	var bara = document.getElementById("myProgress");
	bara.style.background = "green";
	bara.style.height = 30 + 'px';
	
	if(delay==0){ // if a NoGamble trial animate and loop to NoGamble
	    animate({
		duration: progduration,
		timing: function(timeFraction) {
		    return timeFraction;
		},
		draw: function(progress) {
		    bara.style.width = progress * pausewhere + '%';
		}
	    });
	    doprogress++;
	    setTimeout(progressBarLoopNoGamble, progduration);
	}
	else if(delay!=0 && doprogress==1){ // if pre-Gamble, animate and loop to Gamble
	    animate({
		duration: progduration,
		timing: function(timeFraction) {
		    return timeFraction;
		},
		draw: function(progress) {
		    bara.style.width = progress * pausewhere + '%';
		}
	    });
	    doprogress++;
	    setTimeout(progressBarLoopGamble, progduration);
	}
	else if(delay!=0 && doprogress==3){ // if post-Gamble, complete animation and loop to Gamble
	    animate({
                duration: progduration,
                timing: function(timeFraction) {
                    return timeFraction;
                },
                draw: function(progress) {
                    bara.style.width = progress * (100 - pausewhere) + pausewhere + '%';
                }
            });
            doprogress++;
            setTimeout(progressBarLoopGamble, progduration);
	};
    };
    
    
    //This is only initiated when delay=0 i.e. trials that don't have a gamble 
    progressBarLoopNoGamble=function(){
	var src = document.getElementById("stim");
        src.innerHTML="";
	var bara = document.getElementById("myProgress");
        bara.style.height = 0 + 'px';
	//console.log("doprogress is "+doprogress)
	//console.log("pausewhere is "+pausewhere)
	//console.log("progduration is "+progduration)
	if(doprogress == 1) {
	    progressBar();
	}
	else{
	    finish();
	}
    };
    
    //This is what loops progress bar when there is a gamble interrupting i.e. a 'normal' trial
    progressBarLoopGamble=function(){
	var src = document.getElementById("stim");
        src.innerHTML="";
	if(doprogress==1){
	    var bara = document.getElementById("myProgress");
            bara.style.height = 0 + 'px';
	    progressBar();
	}
	else if(doprogress==2){
	    var bara = document.getElementById("myProgress");
            bara.style.height = 30 + 'px';
	    bara.style.width = pausewhere + '%';
	    gamble();
	}
	else if(doprogress==3){
	    var bara = document.getElementById("myProgress");
            bara.style.height = 30 + 'px';
            bara.style.width = pausewhere + '%';
	    progduration = (13 - delay) * 500;
	    progressBar();
	}
	else{
	    var bara = document.getElementById("myProgress");
            bara.style.height = 0 + 'px';
	    finish();
	}

    };

    // general purpose animation function, takes 3 arguments (see http://javascript.info/js-animation for details)
    // 1 - duration in ms
    // 2 - timing function that task fraction of time that passed (0 to 1) and returns the animation completion
    // 3 - draw function that takes animation completion state and draws it
    animate = function({timing, draw, duration}) {
	let onset = performance.now();
	
	requestAnimationFrame(function animate(time) {
	    // timeFraction goes from 0 to 1
	    let timeFraction = (time - onset) / duration;
	    if (timeFraction > 1) timeFraction = 1;
	    
	    // calculate the current animation state
	    let progress = timing(timeFraction)
	    
	    draw(progress); // draw it
	    
	    if (timeFraction < 1) {
		requestAnimationFrame(animate);
	    }
	    
	});
    }

    //This is what causes the gamble to appear during trial
    //If delay !=0, gamble() will initate after 'delay' iterations of progress bar loop
    gamble=function(){
	counter++;
	//console.log("this is a gamble. Press g to take or nothing to not");
	var img = document.createElement("img");
	img.src = "/static/images/Gamble"+currentTrial[0]+".png";
	var src = document.getElementById("stim");
	src.appendChild(img);	
	gambleStim = new Date().getTime();	
	var gambleQ=setTimeout(ignore,3000)
	listeningG=true;
	listening=false;
	window.onkeyup = function(j) {
	    var key = j.keyCode ? j.keyCode : j.which;
	    if(key==71&&listeningG==true){			
		img.src = "/static/images/Gambled.png"
		//	console.log("you gambled! On to next trial")
		clearTimeout(gambleQ);
		listeningG=false;
		response="gamble";
		gambleRT=new Date().getTime() - gambleStim;
		outcomeStim=0;
		outcomeRT=0;
		if(currentTrial[0]==2&currentTrial[1]==4){
		    bonusResponse=response;
		}
		listeningF=true;
		window.onkeyup = function(j) {
		    var key = j.keyCode ? j.keyCode : j.which;
		    if(key==13&&listeningF==true){			
			listeningF=false;
			var bara = document.getElementById("myProgress");
			bara.style.height = 0 + 'px';
			setTimeout(next,600)
		    }
		}
	    }
	}
	doprogress++;
    };	


    //What happens after progress bar 13 was reached /end of trial
    //If 'g' is pressed quickly, than guaranteed reward is claimed;
    finish=function(){
	var img = document.createElement("img");
	img.src = "/static/images/TrialPreFinish.png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	//console.log("press space bar within 1 second to receive standard reward");
	outcomeStim = new Date().getTime();
	var outcomeMiss = setTimeout(outcomeFail,800)
	listening=true;
	window.onkeyup = function(m) {
	    var key = m.keyCode ? m.keyCode : m.which;
	    if(key==32&&listening==true){			
		listening=false;
		img.src = "/static/images/TrialFinish"+currentTrial[0]+".png";
		//console.log("You received standard reward!")
		clearTimeout(outcomeMiss);
		outcomeRT=new Date().getTime() - outcomeStim;
		gambleStim=0;
		gambleRT=0;
		reponse="success";
		if(currentTrial[0]==2&currentTrial[1]==4){
		    bonusResponse=response;
		}
		listening=true;
		window.onkeyup = function(j) {
		    var key = j.keyCode ? j.keyCode : j.which;
		    if(key==13&&listening==true){			
			listening=false;
			//If this doesn't work, remove setTimeout. Just trying to avoid people blowing through trials
			setTimeout(next,1000);
		    }
		}
	    }
	}
    };
    
    //This is what happens if 'g' isn't pressed in 1 sec to receive reward
    outcomeFail=function(){//
	//	console.log("Ran out of time")
	var img = document.createElement("img");
	img.src = "/static/images/TrialFail.png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	listening=false;
	response="fail";
	if(currentTrial[0]==2&currentTrial[1]==4){
	    bonusResponse=response;
	}
	listening=true;
	window.onkeyup = function(m) {
	    var key = m.keyCode ? m.keyCode : m.which;
	    if(key==13&&listening==true){			
		listening=false;
		setTimeout(next,1000);
	    }
	}//
    };
    
    
    
    //Function that runs if nothing was pressed when gamble appeared
    //Gets back to progress bar gamble
    ignore=function(){
	//console.log("You ignored gamble. Now back to progress bar");	
	listening=false;
	progressBarLoopGamble();
    };			

    //The following should not be in any function, only guillaume()
    // Load the stage.html snippet into the body of the page
    
    
    psiTurk.showPage('stage.html');
    //var delay=prompt("When do you want gamble to interrupt" );
    next();
    var expFinish = function() {
	listening=false;
	// console.log("Experiment finished. Bonus should pop up if gambled");
	psiTurk.showPage('stage.html');
	var img = document.createElement("img");
	img.src="/static/images/expFinish.png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	setTimeout(preBonus,5000);
    };
    
};

/****************
* Bonus *

****************/
//Maybe do winwheel.js instead but for now this clunky code works
preBonus =function(){
    //console.log(bonusResponse)
    
    Bonus =function(){	
	psiTurk.showPage('BonusStage.html');
	var options = ["Win", "Lose"];
	
	var startAngle = 0;
	var arc = Math.PI / (options.length / 2);
	var spinTimeout = null;
	
	var spinArcStart = 10;
	var spinTime = 0;
	var spinTimeTotal = 0;
	
	var spins=1;
	var ctx;
	
	document.getElementById("spin").addEventListener("click", spin);
	
	function byte2Hex(n) {
  	    var nybHexString = "0123456789ABCDEF";
  	    return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
	}
	
	function RGB2Color(r,g,b) {
	    return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
	}
	
	function getColor(item, maxitem) {
  	    var phase = 0;
  	    var center = 128;
  	    var width = 127;
  	    var frequency = Math.PI*2/maxitem;
	    
  	    red   = Math.sin(frequency*item+2+phase) * width + center;
  	    green = Math.sin(frequency*item+0+phase) * width + center;
  	    blue  = Math.sin(frequency*item+4+phase) * width + center;
	    
  	    return RGB2Color(red,green,blue);
	}
	
	function drawRouletteWheel() {
  	    var canvas = document.getElementById("canvas");
  	    if (canvas.getContext) {
    		var outsideRadius = 200;
    		var textRadius = 160;
    		var insideRadius = 125;
		
    		ctx = canvas.getContext("2d");
    		ctx.clearRect(0,0,500,500);
		
    		ctx.strokeStyle = "black";
    		ctx.lineWidth = 2;
		
    		ctx.font = 'bold 12px Helvetica, Arial';
		
    		for(var i = 0; i < options.length; i++) {
      		    var angle = startAngle + i * arc;
      		    //ctx.fillStyle = colors[i];
      		    ctx.fillStyle = getColor(i, options.length);
		    
      		    ctx.beginPath();
      		    ctx.arc(250, 250, outsideRadius, angle, angle + arc, false);
      		    ctx.arc(250, 250, insideRadius, angle + arc, angle, true);
      		    ctx.stroke();
      		    ctx.fill();
		    
      		    ctx.save();
      		    ctx.shadowOffsetX = -1;
      		    ctx.shadowOffsetY = -1;
      		    ctx.shadowBlur    = 0;
      		    ctx.shadowColor   = "rgb(220,220,220)";
      		    ctx.fillStyle = "black";
      		    ctx.translate(250 + Math.cos(angle + arc / 2) * textRadius, 
                    		  250 + Math.sin(angle + arc / 2) * textRadius);
      		    ctx.rotate(angle + arc / 2 + Math.PI / 2);
      		    var text = options[i];
      		    ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      		    ctx.restore();
    		} 
		
    		//Arrow
    		ctx.fillStyle = "black";
    		ctx.beginPath();
    		ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    		ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    		ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    		ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    		ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    		ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    		ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    		ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    		ctx.fill();
  	    }
	}
	
	function spin() {
  	    spinAngleStart = Math.random() * 10 + 10;
  	    spinTime = 0;
  	    spinTimeTotal = Math.random() * 3 + 4 * 1000;
  	    rotateWheel();
	}
	
	function rotateWheel() {
  	    spinTime += 30;
  	    if(spinTime >= spinTimeTotal) {
    		stopRotateWheel();
    		return;
  	    }
  	    var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  	    startAngle += (spinAngle * Math.PI / 180);
  	    drawRouletteWheel();
  	    spinTimeout = setTimeout(rotateWheel(), 30);
	}
	
	function stopRotateWheel() {
  	    clearTimeout(spinTimeout);
  	    var degrees = startAngle * 180 / Math.PI + 90;
  	    var arcd = arc * 180 / Math.PI;
  	    var index = Math.floor((360 - degrees % 360) / arcd);
  	    ctx.save();
  	    ctx.font = 'bold 30px Helvetica, Arial';
  	    var text = options[index];
  	    ctx.fillText(text, 250 - ctx.measureText(text).width / 2, 250 + 10);
  	    ctx.restore();
  	    spins--;
  	    setTimeout(quit,10000);
  	    if(options[index]=="Win"){
	  	setTimeout(gambleWin,3000)
  	    }
  	    else{
	  	setTimeout(gambleLoss,3000)
  	    }
	    
	}
	drawRouletteWheel()
	
	function gambleWin() {
	    psiTurk.showPage('stage.html');
	    var img = document.createElement("img");
	    img.src="/static/images/gambledWon.png";
	    var src = document.getElementById("stim");
	    src.innerHTML="";
	    src.appendChild(img);
	    bonusAmount=4;
	}
	
 	function gambleLoss() {
	    psiTurk.showPage('stage.html');
	    var img = document.createElement("img");
	    img.src="/static/images/gambledLoss.png";
	    var src = document.getElementById("stim");
	    src.innerHTML="";
	    src.appendChild(img);
	}
	
	function easeOut(t, b, c, d) {
  	    var ts = (t/=d)*t;
  	    var tc = ts*t;
  	    return b+c*(tc + -3*ts + 3*t);
	}
	
	function quit(){
	    if(spins<=0){
		Questionnaire();}
	    //This else if is put in to prevent any hacking to artificially increase number of spins
	    //If we decide to give more bonuses, remove this clause
	    else if(spins>2){
		//	console.log("THIS SHOULD NOT HAVE HAPPENED, SHOULD NOT BE MORE THAN 1 SPIN")
		Questionnaire();}
	    else{
		//console.log("There are "+spins+" left")
		//	console.log("ERROR")
		psiTurk.recordTrialData({'BonusAmount':"ERROR"})
		Questionnaire();
	    }	
	}
    };
    

    if(bonusResponse=="gamble"){
	var img = document.createElement("img");
	img.src="/static/images/bonusGambled.png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	setTimeout(Bonus,5000)}
    
    //If participant did not gamble on bonus trial, than these conditionals kick in
    else if(bonusResponse=="fail"){
	var img = document.createElement("img");
	img.src="/static/images/bonusTrialFail.png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	setTimeout(Questionnaire,5000)}
    else if(bonusResponse=="success"){
	var img = document.createElement("img");
	img.src="/static/images/bonusTrialSuccess.png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	setTimeout(Questionnaire,10000)}
    
    //The following conditional should never initialize, only when the bonus trial didn't run yet.
    //If this conditional does initialize, than task was prematurely ended
    else {
	var img = document.createElement("img");
	img.src="/static/images/bonusTrialSuccess.png";
	var src = document.getElementById("stim");
	src.innerHTML="";
	src.appendChild(img);
	setTimeout(Questionnaire,7000)
	bonusAmount=2;
    }

};	


/****************
* Questionnaire *
****************/

var Questionnaire = function() {
    
    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";
    
    record_responses = function() {
	
	psiTurk.recordTrialData({'BonusAmount':bonusAmount,'phase':'postquestionnaire', 'status':'submit'});
	
	$('textarea').each( function(i, val) {
	    psiTurk.recordTrialData(this.id, this.value);
	});
	$('select').each( function(i, val) {
	    psiTurk.recordTrialData(this.id, this.value);		
	});
	
    };
    
    prompt_resubmit = function() {
	replaceBody(error_message);
	$("#resubmit").click(resubmit);
    };
    
    resubmit = function() {
	replaceBody("<h1>Trying to resubmit...</h1>");
	reprompt = setTimeout(prompt_resubmit, 10000);
	
	psiTurk.saveData({
	    success: function() {
		clearInterval(reprompt); 
		//    psiTurk.computeBonus('compute_bonus', function(){finish()}); 
	    }, 
	    error: prompt_resubmit
	});
    };
    
    // Load the questionnaire snippet 
    psiTurk.showPage('postquestionnaire.html');
    psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
    
    $("#next").click(function () {
	record_responses();
	psiTurk.saveData({
            success: function(){
		//  psiTurk.computeBonus('compute_bonus', function() { 
                psiTurk.completeHIT(); // when finished saving compute bonus, the quit
		//  }); 
            }, 
            error: prompt_resubmit});
    });
    
    
};





// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){
    psiTurk.doInstructions(
    	instructionPages, // a list of pages you want to display in sequence
    	function() { currentview = new guillaume; } // what you want to do when you are done with instructions
    );
});
