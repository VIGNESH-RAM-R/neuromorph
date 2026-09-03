(function(){
  'use strict';

  var SHAPES = ['circle','square','triangle','star','hexagon'];
  var PALETTE = ['#2563eb','#f59e0b','#0d9488','#7c3aed','#64748b'];
  var SIZE_RADIUS = { small:13, medium:19, large:25 };
  var ROTATIONS = [0,45,90];

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function shuffle(arr){
    var a = arr.slice();
    for (var i=a.length-1;i>0;i--){
      var j = Math.floor(Math.random()*(i+1));
      var tmp=a[i]; a[i]=a[j]; a[j]=tmp;
    }
    return a;
  }
  function pickN(arr, n){ return shuffle(arr).slice(0,n); }

  function polygonPoints(cx,cy,r,sides,rotationDeg){
    var pts=[];
    var rot=(rotationDeg-90)*Math.PI/180;
    for (var i=0;i<sides;i++){
      var angle = rot + i*2*Math.PI/sides;
      pts.push((cx+r*Math.cos(angle)).toFixed(1)+','+(cy+r*Math.sin(angle)).toFixed(1));
    }
    return pts.join(' ');
  }

  function starPoints(cx,cy,outerR,innerR,rotationDeg){
    var pts=[];
    var rot=(rotationDeg-90)*Math.PI/180;
    for (var i=0;i<10;i++){
      var r = i%2===0? outerR: innerR;
      var angle = rot + i*Math.PI/5;
      pts.push((cx+r*Math.cos(angle)).toFixed(1)+','+(cy+r*Math.sin(angle)).toFixed(1));
    }
    return pts.join(' ');
  }

  function shapeMarkup(shape,color,rotation,radius,cx,cy){
    switch(shape){
      case 'circle': return '<circle cx="'+cx+'" cy="'+cy+'" r="'+radius+'" fill="'+color+'" />';
      case 'square': return '<polygon points="'+polygonPoints(cx,cy,radius,4,rotation+45)+'" fill="'+color+'" />';
      case 'triangle': return '<polygon points="'+polygonPoints(cx,cy,radius,3,rotation)+'" fill="'+color+'" />';
      case 'hexagon': return '<polygon points="'+polygonPoints(cx,cy,radius,6,rotation)+'" fill="'+color+'" />';
      case 'star': return '<polygon points="'+starPoints(cx,cy,radius,radius*0.45,rotation)+'" fill="'+color+'" />';
      default: return '';
    }
  }

  function cellSVG(attrs){
    if(!attrs) return '';
    var count = attrs.count||1;
    var radius = SIZE_RADIUS[attrs.size||'medium'];
    if(count>1) radius = radius*(count===2?0.85:0.7);
    var positions = count===1?[50]:count===2?[32,68]:[20,50,80];
    var shapes='';
    positions.forEach(function(x){
      shapes += shapeMarkup(attrs.shape, attrs.color, attrs.rotation||0, radius, x, 50);
    });
    return '<svg viewBox="0 0 100 100" width="100%" height="100%">'+shapes+'</svg>';
  }

  function attrsKey(a){ return [a.shape,a.color,a.rotation,a.size,a.count].join('|'); }

  function generateItem(difficulty){
    var ruleCount = difficulty==='easy'?1: difficulty==='medium'?2:3;
    var allRules = ['rotation','color','size','count','shape'];
    var activeRules = pickN(allRules, ruleCount);

    var shapePool = SHAPES.slice();
    if (activeRules.indexOf('rotation')!==-1){
      shapePool = shapePool.filter(function(s){ return s!=='circle'; });
    }

    var baseShape = pick(shapePool);
    var baseColor = pick(PALETTE);

    var shapeList = activeRules.indexOf('shape')!==-1 ? pickN(shapePool,3) : [baseShape,baseShape,baseShape];
    var colorList = activeRules.indexOf('color')!==-1 ? pickN(PALETTE,3) : [baseColor,baseColor,baseColor];
    var rotationList = activeRules.indexOf('rotation')!==-1 ? [0,45,90] : [0,0,0];
    var sizeList = activeRules.indexOf('size')!==-1 ? ['small','medium','large'] : ['medium','medium','medium'];
    var countList = activeRules.indexOf('count')!==-1 ? [1,2,3] : [1,1,1];

    function cellAttrs(r,c){
      return {
        shape: shapeList[c], color: colorList[c], rotation: rotationList[c],
        size: sizeList[r], count: countList[r]
      };
    }

    var grid = [];
    for (var r=0;r<3;r++){
      var row=[];
      for (var c=0;c<3;c++){
        row.push(r===2&&c===2 ? null : cellAttrs(r,c));
      }
      grid.push(row);
    }

    var correct = cellAttrs(2,2);

    var pool=[];
    activeRules.forEach(function(rule){
      [0,1].forEach(function(altIdx){
        var wrong = Object.assign({}, correct);
        if (rule==='shape') wrong.shape = shapeList[altIdx];
        if (rule==='color') wrong.color = colorList[altIdx];
        if (rule==='rotation') wrong.rotation = rotationList[altIdx];
        if (rule==='size') wrong.size = sizeList[altIdx];
        if (rule==='count') wrong.count = countList[altIdx];
        wrong._errorType = 'wrong_'+rule;
        pool.push(wrong);
      });
    });
    pool.push({
      shape: pick(SHAPES), color: pick(PALETTE), rotation: pick(ROTATIONS),
      size: pick(['small','medium','large']), count: pick([1,2,3]), _errorType:'random_choice'
    });

    var seen = {}; seen[attrsKey(correct)] = true;
    var distractors = [];
    shuffle(pool).forEach(function(d){
      var k = attrsKey(d);
      if (!seen[k] && distractors.length<3){ seen[k]=true; distractors.push(d); }
    });
    var guard=0;
    while (distractors.length<3 && guard<50){
      guard++;
      var d = { shape:pick(SHAPES), color:pick(PALETTE), rotation:pick(ROTATIONS),
        size:pick(['small','medium','large']), count:pick([1,2,3]), _errorType:'random_choice' };
      var k = attrsKey(d);
      if (!seen[k]){ seen[k]=true; distractors.push(d); }
    }

    var correctOption = Object.assign({}, correct, { _isCorrect:true, _errorType:null });
    var options = shuffle([correctOption].concat(distractors.map(function(d){
      return Object.assign({}, d, { _isCorrect:false });
    })));

    return { grid: grid, options: options, activeRules: activeRules, difficulty: difficulty };
  }

  // ---- pure logic above is safe to run in Node for testing ----
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateItem: generateItem, cellSVG: cellSVG, SHAPES: SHAPES, PALETTE: PALETTE };
  }

  // ---- DOM / session logic below only runs in a browser ----
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initApp);
  }

  function initApp(){
    // Was 1 practice + 6 scored (2 easy/medium/hard each) — practice count
    // brought in line with every other weekly game (3, not 1 — enough to
    // actually get the idea before it counts), and scored count raised to
    // 9 (3 easy/medium/hard each) per feedback that 6 felt short.
    var sessionPlan = ['practice','practice','practice','easy','easy','easy','medium','medium','medium','hard','hard','hard'];
    var PRACTICE_COUNT = sessionPlan.filter(function(d){ return d==='practice'; }).length;
    var SCORED_COUNT = sessionPlan.length - PRACTICE_COUNT;
    var scoredResults = [];
    var practiceResult = null; // previously computed but never reported anywhere
    var currentItem = null;
    var itemStartTime = null;
    var timerInterval = null;
    var sessionId = 'sess_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    var patientId = 'demo_patient';

    var instructions = document.getElementById('instructions');
    var gameScreen = document.getElementById('gameScreen');
    var feedbackScreen = document.getElementById('feedbackScreen');
    var resultsScreen = document.getElementById('resultsScreen');
    var startBtn = document.getElementById('startBtn');
    var restartBtn = document.getElementById('restartBtn');
    var patientIdInput = document.getElementById('patientIdInput');
    var progressLabel = document.getElementById('progressLabel');
    var timerText = document.getElementById('timerText');
    var timerFill = document.getElementById('timerFill');
    var matrixGrid = document.getElementById('matrixGrid');
    var optionsGrid = document.getElementById('optionsGrid');
    var feedbackText = document.getElementById('feedbackText');
    var resultsSummary = document.getElementById('resultsSummary');
    var jsonOutput = document.getElementById('jsonOutput');

    startBtn.addEventListener('click', function(){
      patientId = (patientIdInput.value||'').trim() || 'demo_patient';
      scoredResults = [];
      sessionId = 'sess_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
      show(gameScreen);
      loadItem(0);
    });

    restartBtn.addEventListener('click', function(){
      show(instructions);
    });

    function show(screen){
      [instructions,gameScreen,feedbackScreen,resultsScreen].forEach(function(s){ s.classList.add('hidden'); });
      screen.classList.remove('hidden');
    }

    function loadItem(planIndex){
      if (planIndex>=sessionPlan.length){ showResults(); return; }
      var diff = sessionPlan[planIndex];
      currentItem = generateItem(diff==='practice'?'easy':diff);
      if (diff==='practice'){
        var practiceIndex = sessionPlan.slice(0, planIndex+1).filter(function(d){ return d==='practice'; }).length;
        progressLabel.textContent = 'Practice item '+practiceIndex+' of '+PRACTICE_COUNT;
      } else {
        var scoredIndex = planIndex - PRACTICE_COUNT + 1;
        progressLabel.textContent = 'Item '+scoredIndex+' of '+SCORED_COUNT;
      }
      renderMatrix(currentItem);
      renderOptions(currentItem, planIndex);
      itemStartTime = Date.now();
      startTimer(diff==='practice'?60:25, planIndex);
    }

    function renderMatrix(item){
      matrixGrid.innerHTML='';
      for (var r=0;r<3;r++){
        for (var c=0;c<3;c++){
          var cellDiv = document.createElement('div');
          var attrs = item.grid[r][c];
          if (attrs===null){
            cellDiv.className='cell missing';
            cellDiv.textContent='?';
          } else {
            cellDiv.className='cell';
            cellDiv.innerHTML = cellSVG(attrs);
          }
          matrixGrid.appendChild(cellDiv);
        }
      }
    }

    function renderOptions(item, planIndex){
      optionsGrid.innerHTML='';
      item.options.forEach(function(opt){
        var btn = document.createElement('button');
        btn.className='option-btn';
        btn.innerHTML = cellSVG(opt);
        btn.addEventListener('click', function(){
          Array.prototype.forEach.call(optionsGrid.children,function(b){ b.disabled=true; });
          handleAnswer(opt, planIndex);
        });
        optionsGrid.appendChild(btn);
      });
    }

    function startTimer(seconds, planIndex){
      var remaining = seconds;
      var total = seconds;
      timerText.textContent = remaining+'s';
      timerFill.style.width='100%';
      clearInterval(timerInterval);
      timerInterval = setInterval(function(){
        remaining -= 0.1;
        if (remaining<=0){
          clearInterval(timerInterval);
          timerText.textContent='0s';
          Array.prototype.forEach.call(optionsGrid.children,function(b){ b.disabled=true; });
          handleAnswer(null, planIndex);
          return;
        }
        timerText.textContent = Math.ceil(remaining)+'s';
        timerFill.style.width = (remaining/total*100)+'%';
      }, 100);
    }

    function handleAnswer(selectedOption, planIndex){
      clearInterval(timerInterval);
      var responseTimeMs = Date.now()-itemStartTime;
      var isPractice = sessionPlan[planIndex]==='practice';
      var correct=false, errorType=null;
      if (selectedOption===null){ errorType='no_response'; correct=false; }
      else { correct = !!selectedOption._isCorrect; errorType = correct?null:(selectedOption._errorType||'random_choice'); }

      if (!isPractice){
        scoredResults.push({ correct:correct, responseTimeMs:responseTimeMs, errorType:errorType, difficulty: sessionPlan[planIndex] });
        // No correct/incorrect feedback on scored trials — matches every
        // other weekly game (practice gives feedback, the scored
        // assessment doesn't). Stays on gameScreen the whole time, just
        // moves straight to the next item after a brief pause.
        setTimeout(function(){
          loadItem(planIndex+1);
        }, 300);
        return;
      }

      practiceResult = { correct:correct, responseTimeMs:responseTimeMs, errorType:errorType };
      if (typeof window!=='undefined' && window.parent){
        window.parent.postMessage({ source:'neuromorph-game', gameId:'matrix-reasoning', type:'practiceComplete', result:practiceResult }, '*');
      }

      show(feedbackScreen);
      feedbackText.textContent = correct ? 'Correct! That\'s how the pattern works.' : 'Not quite — look at how each attribute changes across rows and columns.';
      feedbackText.style.color = correct ? 'var(--correct)' : 'var(--incorrect)';

      setTimeout(function(){
        show(gameScreen);
        loadItem(planIndex+1);
      }, 900);
    }

    function showResults(){
      show(resultsScreen);
      var result = buildResultJSON();
      var rt = result.response_times;
      var avgRt = rt.length ? Math.round(rt.reduce(function(a,b){return a+b;},0)/rt.length) : 0;
      resultsSummary.innerHTML =
        '<div class="row"><span>Score</span><strong>'+result.raw_score+' / '+result.max_score+'</strong></div>'+
        '<div class="row"><span>Accuracy</span><strong>'+Math.round(result.accuracy*100)+'%</strong></div>'+
        '<div class="row"><span>Avg. response time</span><strong>'+avgRt+' ms</strong></div>'+
        '<div class="row"><span>Items skipped (timeout)</span><strong>'+result.items_skipped+'</strong></div>';
      jsonOutput.textContent = JSON.stringify(result, null, 2);

      if (typeof window!=='undefined' && typeof window.onAssessmentComplete==='function'){
        window.onAssessmentComplete(result);
      }
      // Thin wrapper for the host app (features/04 §A.1): this game is
      // embedded via <iframe>, not mounted in-process like the React
      // games, so its GameResult crosses the frame boundary via
      // postMessage instead of a direct callback — the one addition this
      // vanilla-JS module needed, alongside the existing
      // window.onAssessmentComplete call above.
      if (typeof window!=='undefined' && window.parent){
        window.parent.postMessage({ source:'neuromorph-game', gameId:'matrix-reasoning', type:'complete', result:result }, '*');
      }
    }

    function buildResultJSON(){
      var raw_score = scoredResults.filter(function(r){return r.correct;}).length;
      var max_score = scoredResults.length;
      var accuracy = max_score ? raw_score/max_score : 0;
      var response_times = scoredResults.map(function(r){return r.responseTimeMs;});
      var error_types = scoredResults.map(function(r){return r.correct? null : r.errorType;});
      var items_skipped = scoredResults.filter(function(r){return r.errorType==='no_response';}).length;
      var items_attempted = max_score - items_skipped;
      var item_difficulties = scoredResults.map(function(r){return r.difficulty;});
      return {
        game_id:'matrix_reasoning', lobe:'parietal',
        session_id: sessionId, patient_id: patientId,
        timestamp: new Date().toISOString(),
        difficulty_level:'mixed',
        raw_score: raw_score, max_score: max_score, accuracy: Number(accuracy.toFixed(2)),
        response_times: response_times, error_types: error_types,
        items_attempted: items_attempted, items_skipped: items_skipped,
        item_difficulties: item_difficulties
      };
    }
  }
})();
