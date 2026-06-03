(function(){
(function(){
  "use strict";

  var GAP = 283.2; // millions
  var SURTAX_PENNY = 255; // millions raised by one-cent Duval surtax (illustrative)
  var HOUSEHOLDS = 390000; // approx Duval households for per-household tax estimate
  var BASE_RATE = 0.075; // current Duval combined sales tax rate
  // Property-tax millage model (illustrative). The City can recover revenue by raising the
  // general-services millage, scaled from today's rate-to-revenue ratio.
  var CURRENT_MILLAGE = 11.191; // current City general-services millage rate (mills)
  var PROP_TAX_REV = 1191;      // $M property (ad valorem) tax revenue at the current rate
  var MILLAGE_CAP = 20;         // approx legal millage cap under the consolidated charter
  var REV_PER_MILL = PROP_TAX_REV / CURRENT_MILLAGE; // $M of revenue per mill (~106.4)

  // Service-impact narratives, keyed to the same non-PS departments.
  // Each describes what losing roughly the cut share of staff/budget would mean.
  var serviceImpacts = [
    {dept:"Public Library",
     headline:"Shorter branch hours and possible closures",
     detail:"The 21-branch system runs on staff. Fewer librarians means reduced hours, fewer story times and programs, and pressure to close the smallest neighborhood branches."},
    {dept:"Public Works",
     headline:"Slower road, signal, and streetlight repair",
     detail:"Potholes, broken traffic signals, and dark streetlights take longer to fix. Deferred maintenance also raises long-term repair costs and carries a real safety risk."},
    {dept:"Parks, Recreation & Community Services",
     headline:"Reduced park upkeep and program hours",
     detail:"Community centers, pools, and youth and senior programs lose hours or close. Mowing, cleanup, and field maintenance slow down across the park system."},
    {dept:"Neighborhoods",
     headline:"Blight and code violations pile up",
     detail:"Code enforcement, lot mowing, and animal services thin out. Complaints take longer to resolve, letting nuisance and structural hazards accumulate."},
    {dept:"Planning and Development",
     headline:"Longer permit and inspection waits",
     detail:"Fewer planners and inspectors mean slower permitting and review, which delays both home projects and new construction the city is counting on for growth."}
  ];

  // Per-item taxable purchases for the register example (pre-tax price in $).
  var taxItems = [
    {name:"Dinner out for a family of four", price:80},
    {name:"A $1,200 car repair", price:1200},
    {name:"A new laptop", price:900},
    {name:"A furniture purchase", price:600}
  ];

  // ---- Revenue sources (General Fund, FY25-26 proposed, $M) ----
  var revenue = [
    {name:"Property (ad valorem) taxes", amt:1191},
    {name:"State-shared revenue", amt:233},
    {name:"Contributions from local units", amt:150},
    {name:"Utility service tax", amt:112},
    {name:"Transfers from other funds", amt:76},
    {name:"Franchise fees", amt:48},
    {name:"Communication services tax", amt:33},
    {name:"All other sources", amt:175}
  ];

  // ---- Departments (FY25-26, General Fund). budget $M, emp = employee cap ----
  // ps:true = public safety (protected from cuts). Non-ps share the cut.
  var depts = [
    {name:"Fire and Rescue", budget:387.3, emp:1925, ps:true,
      desc:"Jacksonville Fire and Rescue runs fire stations, ambulances, and emergency medical response across Duval County. Protected from cuts under the proposal."},
    {name:"Sheriff's Office (Patrol & Enforcement)", budget:249.5, emp:1401, ps:true,
      desc:"Frontline policing and patrol. The single largest piece of the Sheriff's Office. Protected from cuts under the proposal."},
    {name:"Corrections", budget:173.2, emp:804, ps:true,
      desc:"Operates the city jail and pretrial detention. Treated as public safety and protected from cuts under the proposal."},
    {name:"Investigations & Homeland Security", budget:102.5, emp:537, ps:true,
      desc:"Detectives, forensics, and security operations within the Sheriff's Office. Protected from cuts."},
    {name:"Police Services", budget:62.6, emp:366, ps:true,
      desc:"Records, training, and support functions for the Sheriff's Office. Treated as public safety."},
    {name:"Public Works", budget:64.3, emp:287, ps:false,
      desc:"Maintains roads, drainage, traffic signals, and city buildings. Not protected from cuts. Streetlight and traffic-signal maintenance also carry safety implications."},
    {name:"Parks, Recreation & Community Services", budget:58.8, emp:253, ps:false,
      desc:"Runs parks, community centers, pools, and youth and senior programs. Among the first places service hours and maintenance get reduced."},
    {name:"Public Library", budget:42.4, emp:307, ps:false,
      desc:"The 21-branch public library system. Branch hours and locations are vulnerable when this budget shrinks."},
    {name:"Personnel & Professional Standards", budget:42.7, emp:250, ps:true,
      desc:"Personnel, training, and professional standards functions within the Sheriff's Office. Treated as public safety and protected from cuts under the proposal."},
    {name:"Neighborhoods", budget:17.8, emp:101, ps:false,
      desc:"Code enforcement, mowing, animal services, and neighborhood cleanup. Cutting it lets blight and code violations build up."},
    {name:"Office of Administrative Services", budget:15.6, emp:153, ps:false,
      desc:"Procurement, fleet, and internal city services. A support function not protected from cuts."},
    {name:"City Council", budget:12.6, emp:65, ps:false,
      desc:"The legislative branch of city government and its staff."},
    {name:"Finance", budget:17.9, emp:80, ps:false,
      desc:"Budgeting, accounting, and treasury for the City. Not protected from cuts."},
    {name:"Supervisor of Elections", budget:9.4, emp:34, ps:false,
      desc:"Runs elections and maintains voter rolls for Duval County."},
    {name:"Planning and Development", budget:5.2, emp:37, ps:false,
      desc:"Reviews development, zoning, and permitting. Slower permitting is a direct consequence of cuts here."},
    {name:"Office of Economic Development", budget:2.9, emp:19, ps:false,
      desc:"Recruits employers and manages incentive deals. A discretionary function exposed to cuts."}
  ];

  // ---------- helpers ----------
  function money(m){
    if(m >= 1000) return "$" + (m/1000).toFixed(2) + "B";
    if(m >= 100) return "$" + m.toFixed(0) + "M";
    return "$" + m.toFixed(1) + "M";
  }
  function fmtFull(m){
    return "$" + Math.round(m*1000000).toLocaleString() ;
  }

  // ---------- render revenue bars ----------
  var revTotal = revenue.reduce(function(s,r){return s+r.amt;},0);
  var maxRev = Math.max.apply(null, revenue.map(function(r){return r.amt;}));
  var revHTML = "";
  revenue.forEach(function(r){
    var pct = (r.amt/maxRev*100).toFixed(1);
    revHTML += '<div class="bar-item">'
      + '<div class="bar-top"><span class="name">'+r.name+'</span><span class="amt">'+money(r.amt)+'</span></div>'
      + '<div class="bar-track"><div class="bar-fill rev" style="width:'+pct+'%"></div></div>'
      + '</div>';
  });
  var _revBars=document.getElementById("revBars"); if(_revBars){ _revBars.innerHTML = revHTML; }

  if(document.getElementById("deptList")){
  // ---------- render departments ----------
  var dl = document.getElementById("deptList");
  var psDepts = depts.filter(function(d){return d.ps;});
  var npDepts = depts.filter(function(d){return !d.ps;});
  var psTotalBudget = psDepts.reduce(function(s,d){return s+d.budget;},0);
  var psTotalEmp = psDepts.reduce(function(s,d){return s+d.emp;},0);

  function deptRow(d, idx, nested){
    var tag = d.ps ? '<span class="tag ps">Public Safety</span>' : '<span class="tag np">Other Services</span>';
    return '<div class="dept'+(nested?' dept-nested':'')+'">'
      + '<button class="dept-btn" aria-expanded="false" aria-controls="dp'+idx+'" id="db'+idx+'">'
        + '<span class="chev" aria-hidden="true">&#9654;</span>'
        + '<span class="dn">'+d.name+'</span>'
        + tag
        + '<span class="da">'+money(d.budget)+'</span>'
      + '</button>'
      + '<div class="dept-panel" id="dp'+idx+'" role="region" aria-labelledby="db'+idx+'">'
        + '<p style="margin:0 0 10px;">'+d.desc+'</p>'
        + '<span class="emp">'+d.emp.toLocaleString()+' employees</span> &middot; '
        + '<span class="emp">'+money(d.budget)+'</span> budget'
      + '</div>'
    + '</div>';
  }

  var dHTML = "";

  // ---- Public Safety top-line, expands to its individual departments ----
  dHTML += '<div class="dept dept-summary">'
    + '<button class="dept-btn ps-summary" aria-expanded="false" aria-controls="psGroup" id="psSummaryBtn">'
      + '<span class="chev" aria-hidden="true">&#9654;</span>'
      + '<span class="dn">Public Safety <span class="dn-sub">police, fire, corrections</span></span>'
      + '<span class="tag ps">Protected</span>'
      + '<span class="da">'+money(psTotalBudget)+'</span>'
    + '</button>'
    + '<div class="dept-group" id="psGroup" role="region" aria-labelledby="psSummaryBtn">'
      + '<p class="group-note">These departments are protected from cuts by the amendment. Together they make up '+money(psTotalBudget)+' and about '+psTotalEmp.toLocaleString()+' positions. Tap each to see detail.</p>';
  psDepts.forEach(function(d){
    var gi = depts.indexOf(d);
    dHTML += deptRow(d, gi, true);
  });
  dHTML += '</div></div>';

  // ---- Non-public-safety departments (the exposed pool) ----
  npDepts.forEach(function(d){
    var gi = depts.indexOf(d);
    dHTML += deptRow(d, gi, false);
  });

  dl.innerHTML = dHTML;

  // toggle for the public safety group
  var psSummaryBtn = document.getElementById("psSummaryBtn");
  psSummaryBtn.addEventListener("click", function(){
    var exp = psSummaryBtn.getAttribute("aria-expanded") === "true";
    psSummaryBtn.setAttribute("aria-expanded", String(!exp));
    document.getElementById("psGroup").classList.toggle("open", !exp);
  });

  // toggles for individual department detail panels
  document.querySelectorAll(".dept-btn:not(.ps-summary)").forEach(function(btn){
    btn.addEventListener("click", function(){
      var exp = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!exp));
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      panel.classList.toggle("open", !exp);
    });
  });

  }
  if(document.getElementById("mixSlider")){
  // ---------- calculator ----------
  var nonPSDepts = depts.filter(function(d){return !d.ps;});
  var nonPSTotal = nonPSDepts.reduce(function(s,d){return s+d.budget;},0);

  var slider = document.getElementById("mixSlider");
  var mixReadout = document.getElementById("mixReadout");
  var cutAmtEl = document.getElementById("cutAmt");
  var cutSubEl = document.getElementById("cutSub");
  var cutListEl = document.getElementById("cutList");
  var taxAmtEl = document.getElementById("taxAmt");
  var taxSubEl = document.getElementById("taxSub");
  var taxListEl = document.getElementById("taxList");

  // meaning-section elements
  var meanCutHead = document.getElementById("meanCutHead");
  var meanCutList = document.getElementById("meanCutList");
  var meanTaxHead = document.getElementById("meanTaxHead");
  var meanTaxList = document.getElementById("meanTaxList");

  function update(){
    var taxShare = parseInt(slider.value,10)/100;   // 0..1 toward taxes
    var cutShare = 1 - taxShare;                     // toward cuts

    // Cuttable pool = departmental non-PS budgets only (no debt/pension/grants).
    var cutPool = nonPSDepts.reduce(function(s,d){return s+d.budget;},0); // ~246.9M
    // The cut side targets a share of the shortfall, but can never exceed the cuttable pool.
    var cutTarget = GAP * cutShare;
    var cutDollars = Math.min(cutTarget, cutPool);
    // Taxes/fees cover everything the cuts cannot.
    var taxDollars = GAP - cutDollars;

    // Zero out whole departments, SMALLEST budget first, until cutDollars is reached.
    var bySize = nonPSDepts.slice().sort(function(a,b){return a.budget-b.budget;});
    var running = 0, jobsLost = 0;
    var cutState = []; // {d, state:'full'|'partial'|'none', loss, jobs}
    bySize.forEach(function(d){
      if(running >= cutDollars - 0.01){
        cutState.push({d:d, state:'none', loss:0, jobs:0});
      } else if(running + d.budget <= cutDollars + 0.01){
        running += d.budget;
        jobsLost += d.emp;
        cutState.push({d:d, state:'full', loss:d.budget, jobs:d.emp});
      } else {
        // partial: the boundary department absorbs the remainder
        var rem = cutDollars - running;
        var frac = rem / d.budget;
        running += rem;
        var pj = Math.round(d.emp * frac);
        jobsLost += pj;
        cutState.push({d:d, state:'partial', loss:rem, jobs:pj});
      }
    });

    // readout + accessible value text
    var cutPctOfGap = Math.round(cutDollars / GAP * 100);
    var taxPctOfGap = 100 - cutPctOfGap;
    mixReadout.innerHTML = "Closing <b>"+cutPctOfGap+"%</b> with service cuts and <b>"+taxPctOfGap+"%</b> with new taxes &amp; fees";
    slider.setAttribute("aria-valuetext", cutPctOfGap+" percent service cuts, "+taxPctOfGap+" percent new taxes and fees");

    // ---- CUTS side ----
    cutAmtEl.textContent = money(cutDollars);
    var fullCount = cutState.filter(function(c){return c.state==='full';}).length;
    if(cutDollars < 0.05){
      cutSubEl.textContent = "No departments eliminated at this setting";
    } else if(cutDollars >= cutPool - 0.05){
      cutSubEl.textContent = "Every cuttable department eliminated, an estimated " + jobsLost.toLocaleString() + " positions";
    } else {
      cutSubEl.textContent = fullCount + (fullCount===1?" department":" departments") + " eliminated entirely, an estimated " + jobsLost.toLocaleString() + " positions";
    }

    // list departments, largest first for display, showing eliminated / reduced / funded
    var display = cutState.slice().sort(function(a,b){return b.d.budget-a.d.budget;});
    var cHTML = "";
    if(cutDollars < 0.05){
      cHTML = '<li><span>No departments eliminated at this setting</span><span class="ci">$0</span></li>';
    } else {
      display.forEach(function(c){
        var label, cls;
        if(c.state==='full'){ label='Eliminated'; cls='ci'; }
        else if(c.state==='partial'){ label='Reduced'; cls='ci'; }
        else { label='Still funded'; cls='ci muted-ci'; }
        var amt = c.loss>0 ? '&minus;'+money(c.loss) : '&mdash;';
        var sub = c.state==='none' ? 'kept at current funding'
                 : (c.state==='partial' ? '~'+c.jobs.toLocaleString()+' positions (partial)'
                                        : '~'+c.jobs.toLocaleString()+' positions');
        cHTML += '<li><span>'+c.d.name+'<br><span class="sub-emp">'+sub+'</span></span><span class="'+cls+'">'+amt+'</span></li>';
      });
      cHTML += '<li class="total-row"><span>Total from service cuts<br><span class="sub-emp">~'+jobsLost.toLocaleString()+' positions</span></span><span class="ci">&minus;'+money(cutDollars)+'</span></li>';
      if(cutDollars >= cutPool - 0.05){
        cHTML += '<li class="resid-row"><span>Still unfunded after cutting everything<br><span class="sub-emp">must come from taxes &amp; fees</span></span><span class="ci">'+money(GAP-cutPool)+'</span></li>';
      }
    }
    cutListEl.innerHTML = cHTML;

    // reduceFactor retained for the meaning-section job estimates (avg across pool)
    var reduceFactor = cutPool > 0 ? (cutDollars/cutPool) : 0;

    // ---- TAX side ----
    taxAmtEl.textContent = money(taxDollars);
    taxSubEl.textContent = "New revenue the City would have to raise";

    var surtaxPennies = taxDollars / SURTAX_PENNY;        // fraction of a penny surtax (illustrative)
    var addedMills = taxDollars / REV_PER_MILL;            // extra mills needed (illustrative)
    var newMillage = CURRENT_MILLAGE + addedMills;
    var tHTML = "";
    if(taxDollars < 0.05){
      tHTML = '<li><span>No new taxes at this setting</span><span class="ci">$0</span></li>';
    } else {
      tHTML += '<li><span>Property tax millage increase<br><span class="sub-emp">'+CURRENT_MILLAGE.toFixed(2)+' &rarr; '+newMillage.toFixed(2)+' mills (cap ~'+MILLAGE_CAP+')</span></span><span class="ci">+'+addedMills.toFixed(2)+' mills</span></li>';
      tHTML += '<li><span>Or an equivalent local sales surtax</span><span class="ci">+'+surtaxPennies.toFixed(2)+'&cent;</span></li>';
    }
    taxListEl.innerHTML = tHTML;

    // ---- MEANING: service side ----
    if(cutDollars < 0.05){
      meanCutHead.textContent = "No service departments eliminated at this setting";
    } else {
      meanCutHead.textContent = "An estimated " + jobsLost.toLocaleString() + " positions cut, with whole departments eliminated";
    }
    var mcHTML = "";
    if(cutDollars < 0.05){
      mcHTML = '<li><span class="ihead">No service cuts at this setting</span><span class="idetail">Move the slider left to eliminate departments.</span></li>';
    } else {
      // show which of the narrated services are fully eliminated vs reduced at this setting
      serviceImpacts.forEach(function(s){
        var cs = cutState.filter(function(c){return c.d.name===s.dept;})[0];
        var statusTxt;
        if(!cs || cs.state==='none') statusTxt = '('+s.dept+': still funded at this setting)';
        else if(cs.state==='full') statusTxt = '('+s.dept+': eliminated, about '+cs.jobs.toLocaleString()+' positions)';
        else statusTxt = '('+s.dept+': reduced, about '+cs.jobs.toLocaleString()+' positions)';
        mcHTML += '<li><span class="ihead">'+s.headline+'</span>'
          + '<span class="idetail">'+s.detail+' <em>'+statusTxt+'</em></span></li>';
      });
    }
    meanCutList.innerHTML = mcHTML;

    // ---- MEANING: tax side ----
    var addedRate = (surtaxPennies/100); // extra rate as a decimal (cents -> rate points)
    var newRate = BASE_RATE + addedRate;
    var perHouseholdYr = (taxDollars*1000000) / HOUSEHOLDS;
    meanTaxHead.textContent = "About $" + Math.round(perHouseholdYr).toLocaleString() + " more per household each year";
    var mtHTML = "";
    if(taxDollars < 0.05){
      mtHTML = '<li><span class="ihead">No added cost at this setting</span><span class="idetail">Move the slider right to see the effect of new taxes.</span></li>';
    } else {
      mtHTML += '<li><div class="impact-row"><span class="ihead">Combined sales tax rate</span>'
        + '<span class="icost">' + (BASE_RATE*100).toFixed(1) + '% &rarr; ' + (newRate*100).toFixed(2) + '%</span></div>'
        + '<span class="idetail">Groceries and medicine stay exempt. The increase applies to other taxable purchases.</span></li>';
      taxItems.forEach(function(it){
        var extra = it.price * addedRate;
        mtHTML += '<li><div class="impact-row"><span class="ihead">'+it.name+'</span>'
          + '<span class="icost">+$'+ extra.toFixed(2) +'</span></div></li>';
      });
    }
    meanTaxList.innerHTML = mtHTML;
  }

  slider.addEventListener("input", update);
  update();

  }
  if(document.getElementById("byoService")){
  // ============ BUILD YOUR OWN BUDGET ============
  // Service departments (cuttable). Pull non-PS depts from the dataset.
  var byoService = nonPSDepts.map(function(d){
    return {name:d.name, budget:d.budget, emp:d.emp, locked:false, funded:d.budget};
  });
  // Locked items: the non-departmental ~$654.1M, broken into recognizable pieces.
  var byoLocked = [
    {name:"Debt service & repayments", budget:260.0, locked:true, funded:260.0, acked:false,
     note:"Bond payments owed to lenders. Missing them would affect the city's credit rating."},
    {name:"Pension contributions (UAAL & current)", budget:200.0, locked:true, funded:200.0, acked:false,
     note:"Retirement promised to employees by contract. Cannot be skipped by law."},
    {name:"Transfers to other funds", budget:120.0, locked:true, funded:120.0, acked:false,
     note:"Required transfers that keep other city operations running."},
    {name:"Grants, aid & community contributions", budget:74.1, locked:true, funded:74.1, acked:false,
     note:"Money to nonprofits, health, and community programs. Discretionary but already committed."}
  ];

  var byoServiceEl = document.getElementById("byoService");
  var byoLockedEl = document.getElementById("byoLocked");
  var byoClosedEl = document.getElementById("byoClosed");
  var byoFillEl = document.getElementById("byoFill");
  var byoBarEl = document.getElementById("byoBar");
  var byoStatusEl = document.getElementById("byoStatus");
  var byoNoteEl = document.getElementById("byoNote");
  var byoResetBtn = document.getElementById("byoReset");

  var serviceMaxTotal = byoService.reduce(function(s,d){return s+d.budget;},0);

  // Build one adjustable (slider) row per item; created once, then only the tally updates.
  function makeItem(it, locked){
    var wrap = document.createElement("div");
    wrap.className = "byo-item adjust" + (locked ? " locked-item" : "");

    var top = document.createElement("div");
    top.className = "byo-adj-top";
    top.innerHTML = '<span class="bi-name">'+it.name
      + (locked ? '<span class="byo-adj-lock">'+it.note+'</span>' : '')
      + '</span><span class="bi-amt">'+money(it.budget)+'</span>';
    wrap.appendChild(top);

    var slider = document.createElement("input");
    slider.type = "range";
    slider.className = "byo-slider";
    slider.min = 0;
    slider.max = it.budget;
    slider.step = it.budget / 200;
    slider.value = it.funded;
    slider.setAttribute("aria-label", "Funding for " + it.name + ", out of " + money(it.budget));
    wrap.appendChild(slider);

    var foot = document.createElement("div");
    foot.className = "byo-adj-foot";
    var fundedSpan = document.createElement("span");
    fundedSpan.className = "funded-lvl";
    var cutSpan = document.createElement("span");
    cutSpan.className = "cut-lvl";
    foot.appendChild(fundedSpan);
    foot.appendChild(cutSpan);
    wrap.appendChild(foot);

    function refreshItem(){
      var cut = it.budget - it.funded;
      fundedSpan.textContent = money(it.funded) + " funded";
      if(cut < 0.05){
        cutSpan.textContent = "fully funded";
        cutSpan.className = "cut-lvl none";
      } else {
        cutSpan.textContent = (locked ? "broken " : "cut ") + money(cut);
        cutSpan.className = "cut-lvl";
      }
    }

    slider.addEventListener("input", function(){
      var val = parseFloat(slider.value);
      if(locked && val < it.budget - 0.001 && !it.acked){
        var ok = window.confirm("Reducing \""+it.name+"\" means breaking a legal or contractual obligation. In reality the city cannot simply do this. Continue anyway to see what it would take?");
        if(!ok){ slider.value = it.budget; val = it.budget; }
        else { it.acked = true; }
      }
      it.funded = val;
      refreshItem();
      tally();
    });

    it._slider = slider;
    it._refresh = refreshItem;
    refreshItem();
    return wrap;
  }

  function buildItems(){
    byoServiceEl.innerHTML = "";
    byoLockedEl.innerHTML = "";
    byoService.forEach(function(it){ byoServiceEl.appendChild(makeItem(it, false)); });
    byoLocked.forEach(function(it){ byoLockedEl.appendChild(makeItem(it, true)); });
  }

  function tally(){
    var closed = 0, serviceCut = 0;
    byoService.forEach(function(it){ var c = it.budget - it.funded; closed += c; serviceCut += c; });
    byoLocked.forEach(function(it){ closed += (it.budget - it.funded); });
    var pct = Math.min(100, closed / GAP * 100);
    byoClosedEl.textContent = money(closed);
    byoFillEl.style.width = pct + "%";
    byoBarEl.setAttribute("aria-valuenow", closed.toFixed(1));

    var remaining = GAP - closed;
    if(closed >= GAP - 0.05){
      byoFillEl.classList.add("green");
      byoStatusEl.classList.add("win");
      byoStatusEl.textContent = "Shortfall closed. The funding levels you set show what reaching that total requires.";
    } else {
      byoFillEl.classList.remove("green");
      byoStatusEl.classList.remove("win");
      byoStatusEl.textContent = money(remaining) + " still to cut.";
    }

    var anyLockedCut = byoLocked.some(function(it){ return it.funded < it.budget - 0.05; });
    if(anyLockedCut){
      byoNoteEl.innerHTML = "Closing the gap here required reducing obligations the city legally cannot skip, such as debt or pensions. This illustrates that the shortfall is larger than the realistically cuttable budget.";
    } else if(serviceCut >= serviceMaxTotal - 0.05){
      byoNoteEl.innerHTML = "Even reducing every cuttable service department to zero (about "+money(serviceMaxTotal)+") leaves "+money(GAP-serviceMaxTotal)+" of the shortfall unclosed. Reaching it would mean reducing locked obligations such as debt or pensions.";
    } else {
      byoNoteEl.innerHTML = "The cuttable service departments total only about "+money(serviceMaxTotal)+", less than the "+money(GAP)+" gap. Adjust the sliders to see how close you can get.";
    }
  }

  byoResetBtn.addEventListener("click", function(){
    byoService.forEach(function(it){ it.funded = it.budget; if(it._slider){it._slider.value = it.budget;} if(it._refresh){it._refresh();} });
    byoLocked.forEach(function(it){ it.funded = it.budget; it.acked = false; if(it._slider){it._slider.value = it.budget;} if(it._refresh){it._refresh();} });
    tally();
  });

  buildItems();
  tally();

  }
  // ============ SPENDING CHARTS (real vs nominal) ============
  // Data from City ACFR Statement of Activities 2015-2024, CPI-adjusted to 2015 dollars ($ thousands).
  var spend = [
    {y:2015, nom:1359697, real:1359697, pop:866345},
    {y:2016, nom:1386638, real:1375263, pop:881502},
    {y:2017, nom:1549488, real:1510673, pop:893203},
    {y:2018, nom:1660811, real:1572816, pop:904170},
    {y:2019, nom:1682495, real:1565002, pop:913521},
    {y:2020, nom:1975372, real:1819485, pop:920570},
    {y:2021, nom:1934545, real:1691142, pop:954614},
    {y:2022, nom:1990342, real:1603245, pop:975614},
    {y:2023, nom:2424043, real:1892459, pop:993468},
    {y:2024, nom:2548850, real:1933914, pop:1010000}
  ];
  // Public-safety spending by year ($ thousands), from the same ACFR statement of activities.
  // Non-public-safety spending is computed as the total above minus these figures.
  var psSpend = [
    {y:2015, nom:629100,  real:629100},
    {y:2016, nom:625227,  real:620098},
    {y:2017, nom:787756,  real:768022},
    {y:2018, nom:867834,  real:821854},
    {y:2019, nom:867176,  real:806619},
    {y:2020, nom:1110858, real:1023194},
    {y:2021, nom:1161203, real:1015101},
    {y:2022, nom:903833,  real:728049},
    {y:2023, nom:1321889, real:1032003},
    {y:2024, nom:1460293, real:1107982}
  ];

  function svgEl(tag, attrs){
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for(var k in attrs){ e.setAttribute(k, attrs[k]); }
    return e;
  }

  // ---- Trend chart (indexed to 100 at 2015 so three series share a scale) ----
  (function drawTrend(){
    var host = document.getElementById("chartTrend");
    if(!host) return;
    var W=700, H=360, mL=46, mR=16, mT=14, mB=40;
    var pw=W-mL-mR, ph=H-mT-mB;
    var base=spend[0];
    var series = {
      nom: spend.map(function(d){return d.nom/base.nom*100;}),
      real: spend.map(function(d){return d.real/base.real*100;}),
      pc: spend.map(function(d){return (d.real/d.pop)/(base.real/base.pop)*100;})
    };
    var allv = series.nom.concat(series.real, series.pc);
    var ymin=90, ymax=Math.ceil(Math.max.apply(null,allv)/10)*10;
    var n=spend.length;
    function px(i){return mL + pw*(i/(n-1));}
    function py(v){return mT + ph*(1-(v-ymin)/(ymax-ymin));}
    var svg = svgEl("svg",{viewBox:"0 0 "+W+" "+H,preserveAspectRatio:"xMidYMid meet"});
    // gridlines + y labels (index values)
    for(var g=ymin; g<=ymax; g+=20){
      svg.appendChild(svgEl("line",{x1:mL,y1:py(g),x2:W-mR,y2:py(g),class:"cl-grid","stroke-width":1}));
      var t=svgEl("text",{x:mL-8,y:py(g)+4,class:"cl-txt","font-size":12,"text-anchor":"end"}); t.textContent=g; svg.appendChild(t);
    }
    // x labels (every other year)
    spend.forEach(function(d,i){
      if(i%2===0 || i===n-1){
        var t=svgEl("text",{x:px(i),y:H-mB+22,class:"cl-txt","font-size":12,"text-anchor":"middle"}); t.textContent=d.y; svg.appendChild(t);
      }
    });
    // axis baseline
    svg.appendChild(svgEl("line",{x1:mL,y1:mT,x2:mL,y2:mT+ph,class:"cl-axis","stroke-width":1.5}));
    function path(vals, cls, dash){
      var d="";
      vals.forEach(function(v,i){ d+=(i?"L":"M")+px(i)+" "+py(v)+" "; });
      var p=svgEl("path",{d:d,fill:"none",class:cls,"stroke-width":3,"stroke-linejoin":"round"});
      if(dash) p.setAttribute("stroke-dasharray","7 5");
      svg.appendChild(p);
    }
    path(series.nom,"cl-nom",true);
    path(series.real,"cl-real",true);
    path(series.pc,"cl-pc");
    // dots marking each line's endpoint
    svg.appendChild(svgEl("circle",{cx:px(n-1),cy:py(series.nom[n-1]),r:4,class:"cl-dot-nom"}));
    svg.appendChild(svgEl("circle",{cx:px(n-1),cy:py(series.real[n-1]),r:4,class:"cl-dot-real"}));
    // Highlight the inflation-adjusted, per-resident pace: about +2.2% per year.
    var pcY = py(series.pc[n-1]);
    svg.appendChild(svgEl("circle",{cx:px(n-1),cy:pcY,r:5,class:"cl-dot-pc"}));
    var hl=svgEl("text",{x:px(n-1)-10,y:pcY+6,class:"chart-hl","text-anchor":"end"});
    hl.textContent="+2.2% / yr"; svg.appendChild(hl);
    var hls=svgEl("text",{x:px(n-1)-10,y:pcY+22,class:"chart-hl-sub","text-anchor":"end"});
    hls.textContent="real, per resident"; svg.appendChild(hls);
    host.appendChild(svg);
  })();

  // ---- Non-public-safety trend chart (actual figures, parallels the first chart) ----
  // Non-PS spending = total governmental-activities spending minus the public-safety category,
  // year by year, from the ACFR statement of activities.
  (function drawNonPS(){
    var host = document.getElementById("chartNonPS");
    if(!host) return;
    var n = spend.length;
    // Build the non-PS series (total minus public safety), indexing each measure to 100 at 2015.
    var derived = spend.map(function(d,i){
      var ps = psSpend[i];
      return {y:d.y, nom:d.nom - ps.nom, real:d.real - ps.real, pop:d.pop};
    });
    var nb = derived[0];
    var series = {
      nom: derived.map(function(d){return d.nom/nb.nom*100;}),
      real: derived.map(function(d){return d.real/nb.real*100;}),
      pc: derived.map(function(d){return (d.real/d.pop)/(nb.real/nb.pop)*100;})
    };

    var W=700, H=360, mL=46, mR=16, mT=14, mB=40;
    var pw=W-mL-mR, ph=H-mT-mB;
    var allv = series.nom.concat(series.real, series.pc);
    var ymin=Math.floor(Math.min.apply(null,allv)/10)*10;
    var ymax=Math.ceil(Math.max.apply(null,allv)/10)*10;
    function px(i){return mL + pw*(i/(n-1));}
    function py(v){return mT + ph*(1-(v-ymin)/(ymax-ymin));}
    var svg = svgEl("svg",{viewBox:"0 0 "+W+" "+H,preserveAspectRatio:"xMidYMid meet"});
    for(var g=ymin; g<=ymax; g+=20){
      svg.appendChild(svgEl("line",{x1:mL,y1:py(g),x2:W-mR,y2:py(g),class:"cl-grid","stroke-width":1}));
      var t=svgEl("text",{x:mL-8,y:py(g)+4,class:"cl-txt","font-size":12,"text-anchor":"end"}); t.textContent=g; svg.appendChild(t);
    }
    derived.forEach(function(d,i){
      if(i%2===0 || i===n-1){
        var t=svgEl("text",{x:px(i),y:H-mB+22,class:"cl-txt","font-size":12,"text-anchor":"middle"}); t.textContent=d.y; svg.appendChild(t);
      }
    });
    svg.appendChild(svgEl("line",{x1:mL,y1:mT,x2:mL,y2:mT+ph,class:"cl-axis","stroke-width":1.5}));
    function path(vals, cls, dash){
      var d="";
      vals.forEach(function(v,i){ d+=(i?"L":"M")+px(i)+" "+py(v)+" "; });
      var p=svgEl("path",{d:d,fill:"none",class:cls,"stroke-width":3,"stroke-linejoin":"round"});
      if(dash) p.setAttribute("stroke-dasharray","7 5");
      svg.appendChild(p);
    }
    // match the first chart: nominal & real dashed, real-per-resident solid
    path(series.nom,"cl-nom",true);
    path(series.real,"cl-real",true);
    path(series.pc,"cl-pc");
    // dots marking each line's endpoint
    svg.appendChild(svgEl("circle",{cx:px(n-1),cy:py(series.nom[n-1]),r:4,class:"cl-dot-nom"}));
    svg.appendChild(svgEl("circle",{cx:px(n-1),cy:py(series.real[n-1]),r:4,class:"cl-dot-real"}));
    // Highlight the inflation-adjusted, per-resident change: about -3% over the period.
    var pcY = py(series.pc[n-1]);
    svg.appendChild(svgEl("circle",{cx:px(n-1),cy:pcY,r:5,class:"cl-dot-pc"}));
    var hl=svgEl("text",{x:px(n-1)-10,y:pcY+6,class:"chart-hl","text-anchor":"end"});
    hl.textContent="−3%"; svg.appendChild(hl);
    var hls=svgEl("text",{x:px(n-1)-10,y:pcY+22,class:"chart-hl-sub","text-anchor":"end"});
    hls.textContent="real, per resident"; svg.appendChild(hls);
    host.appendChild(svg);
  })();

  // ============ REGULATORY FAQ TOGGLES ============
  document.querySelectorAll(".reg-btn").forEach(function(btn){
    btn.addEventListener("click", function(){
      var exp = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!exp));
      document.getElementById(btn.getAttribute("aria-controls")).classList.toggle("open", !exp);
    });
  });
})();
})();

// Hide the sticky top bar on scroll-down (mobile only); reveal on scroll-up.
// CSS gates the actual hiding to <=760px, so this is inert on desktop.
(function(){
  var siteNav = document.querySelector("nav");
  if(!siteNav) return;
  var lastY = window.pageYOffset || 0, ticking = false;
  function onScroll(){
    var y = window.pageYOffset || 0;
    if(y > lastY + 6 && y > 90){ siteNav.classList.add("nav-hidden"); }
    else if(y < lastY - 6 || y <= 90){ siteNav.classList.remove("nav-hidden"); }
    lastY = y; ticking = false;
  }
  window.addEventListener("scroll", function(){
    if(!ticking){ window.requestAnimationFrame(onScroll); ticking = true; }
  }, {passive:true});
})();
