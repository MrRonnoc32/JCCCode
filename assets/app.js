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

  // ---- Council Auditor FY25/26 GF/GSD budget (transcribed). Amounts in dollars. ----
  // Protected = permitted property-tax uses under the amendment (public safety, debt, retirement).
  var TOTAL_BUDGET = 2003918147;
  var PROTECTED = [
    {name:"Public Safety", note:"Sheriff's Office, Fire & Rescue, JFRD/JSO pensions", amt:1171622026},
    {name:"Debt service", note:"payments on existing bonds", amt:123952217},
    {name:"Pension liability (other)", note:"retirement obligations", amt:15801681}
  ];
  // Cuttable = everything else, by the auditor's categories, with line items.
  var CUT_GROUPS = [
    {key:"depts", name:"Non-Public-Safety Departments", items:[{name:"Administrative Services",amt:16009491},{name:"Advisory Boards And Commissions",amt:519822},{name:"City Council",amt:12614754},{name:"Clerk of the Court",amt:1526257},{name:"Courts",amt:5128176},{name:"Downtown Investment Authority",amt:746336},{name:"Economic Development",amt:3078542},{name:"Employee Services",amt:7308731},{name:"Ethics",amt:644469},{name:"Finance",amt:17191785},{name:"General Counsel - Delegation/Settlements",amt:149978},{name:"Health Administrator",amt:1895068},{name:"Inspector General's Office",amt:1541130},{name:"Jacksonville Human Rights Commission",amt:1040332},{name:"Mayor's Office",amt:4864399},{name:"Medical Examiner",amt:7098044},{name:"Military Affairs and Veterans",amt:1433663},{name:"Neighborhoods",amt:12243629},{name:"Parks, Recreation & Community Services",amt:57211570},{name:"Planning and Development",amt:4599011},{name:"Public Defender",amt:1509142},{name:"Public Library",amt:39022019},{name:"Public Works",amt:63475277},{name:"Sports and Entertainment",amt:1122150},{name:"State Attorney",amt:2841154},{name:"Supervisor of Elections",amt:9429334}]},
    {key:"citywide", name:"Citywide Activities", items:[{name:"415 Limit Pension Cost",amt:36000},{name:"Alcohol Rehabilitation Program",amt:399989},{name:"Annual Independent Audit",amt:429500},{name:"Gator Bowl Game",amt:464409},{name:"Florida-Florida State Baseball",amt:55000},{name:"BJP 20% Gas Tax Contrib To Fiscal Agent",amt:4739612},{name:"Business Improvement District - Downtown Vision",amt:804877},{name:"Economic Incentives",amt:23887260},{name:"Employee Parking Subsidy - 50% Discount City Garages",amt:531300},{name:"Employee Training and Travel",amt:465785},{name:"FAMIS / BPREP Annual Maintenance",amt:259000},{name:"Filing Fee Local Ord-Public Def FS 27.54",amt:15000},{name:"Filing Fee Local Ord-St Attorney FS 27.34",amt:52000},{name:"JPA - Contributions To/From",amt:13513769},{name:"JTA - Contributions To/From",amt:1856342},{name:"Juvenile Justice",amt:6081861},{name:"Lapse Personnel Lapse-Contingency",amt:-4914206},{name:"License Agreements And Fees",amt:69265},{name:"Lobbyist Fees",amt:120000},{name:"Manatee Study",amt:103549},{name:"Medicaid Program F.S. 409.915",amt:22746000},{name:"Municipal Dues & Affiliation",amt:9410},{name:"Municipal Dues/Affiliation Sec 10.109",amt:230603},{name:"N. FL TPO (Transportation Planning Org)",amt:265648},{name:"Non Departmental IS Allocations",amt:1187028},{name:"Refund - Taxes Overpaid, Error, Controversy",amt:5000},{name:"Special Committee on Duval DOGE - 2% Lapse",amt:-2138202},{name:"Stormwater 501c3 Low Income Subsidy",amt:1485303},{name:"Tax Deed Purchases",amt:80000},{name:"WJCT Lease Payment",amt:30000},{name:"Zoo Contract",amt:1282500},{name:"Art In Public Places - Insurance",amt:5408},{name:"Cultural Service Grants",amt:7000000},{name:"Public Service Grants",amt:7200000},{name:"988 Crisis Counseling Call Center",amt:200000},{name:"Agape Community Health Center",amt:121724},{name:"Florida Black Expo",amt:100000},{name:"Florida State College at Jacksonville - Fire Academy Burn Building",amt:3500000},{name:"FOP Foundation",amt:200000},{name:"Infant Mortality",amt:200000},{name:"Jacksonville Classical Academy",amt:300000},{name:"Jacksonville Historical Society",amt:200000},{name:"JaxCareConnect",amt:1499557},{name:"Sulzbacher Center",amt:400000},{name:"United Way 211",amt:250000},{name:"Volunteers in Medicine",amt:200000},{name:"Duval County Fair Association (DCFA) 2024-285-E",amt:1500000},{name:"Shands Jax Medical Center - Indigent Care",amt:56000000},{name:"Telehealth",amt:1500000}]},
    {key:"transfers", name:"Transfers Out", items:[{name:"Special Events - General Fund",amt:10701104},{name:"Emergency Reserve",amt:780000},{name:"Multiyear Programs and Initiatives",amt:18000000},{name:"Journey Forward",amt:100000},{name:"Property Appraiser",amt:13266764},{name:"Tax Collector",amt:14796904},{name:"Kids Hope Alliance Fund",amt:59310767},{name:"Jacksonville Upward Mobility Program",amt:461000},{name:"Homelessness Initiatives Special Revenue Fund",amt:4331677},{name:"Huguenot Park",amt:355735},{name:"Cecil Field Commerce Center",amt:1611160},{name:"Beach Erosion - Local",amt:500000},{name:"Animal Care & Protective Services Programs",amt:295759},{name:"General Trust & Agency",amt:600000},{name:"Art In Public Places Trust Fund",amt:327274},{name:"Library Conference Facility Trust",amt:89480},{name:"Recording Fees Technology",amt:482348},{name:"Duval County Teen Court Programs Trust",amt:182074},{name:"Court Costs $65 Fee FS: 939.185",amt:452301},{name:"Solid Waste Disposal",amt:51995648},{name:"Equestrian Center-NFES Horse",amt:563249},{name:"City Venues-City",amt:33493841},{name:"City Venues Capital Project Fund",amt:500000},{name:"Group Health",amt:21485229}]},
    {key:"contingencies", name:"Contingencies", items:[{name:"Budget Stabilization Account",amt:1059243},{name:"Executive Operating Contingency - Council",amt:100000},{name:"Executive Operating Contingency - Mayor",amt:100000},{name:"Federal Matching Grants",amt:6944496},{name:"Federal Programs - Reserve",amt:250000},{name:"FIND Grant Match",amt:3060000},{name:"International Association of Fire Fighters",amt:245320},{name:"Municipal Dues & Affiliation",amt:830000},{name:"Riverfront Parks",amt:2600000},{name:"Salvation Army",amt:150000},{name:"Special Committee on Duval DOGE - 2% Lapse",amt:5868505},{name:"Youth Empowerment City Council Special Committee",amt:5000000}]},
    {key:"interlocal", name:"Interlocal Agreements", items:[{name:"Interlocal Agreements",amt:2877791}]},
  ];
  CUT_GROUPS.forEach(function(g){ g.total = g.items.reduce(function(s,i){return s+i.amt;},0); g.cutFrac = 0; });
  var CUT_TOTAL = CUT_GROUPS.reduce(function(s,g){return s+g.total;},0);    // ~$692.5M
  var PROTECTED_TOTAL = PROTECTED.reduce(function(s,p){return s+p.amt;},0); // ~$1,311.4M
  function usd(d){ var n=Math.round(Math.abs(d)).toLocaleString(); return (d<0?"-$":"$")+n; }

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
  // ---------- render the auditor budget breakdown (read-only accordion) ----------
  var dl = document.getElementById("deptList");
  var H = "", _ci = 0;
  function catBlock(name, sub, tagHtml, totalDollars, items){
    var id = "cg"+(_ci++); var has = items && items.length;
    H += '<div class="dept dept-summary">'
      + '<button class="dept-btn ps-summary'+(has?'':' no-exp')+'" aria-expanded="false"'
        + (has?(' aria-controls="'+id+'"'):'') + ' id="'+id+'b">'
        + '<span class="chev" aria-hidden="true"'+(has?'':' style="visibility:hidden"')+'>&#9654;</span>'
        + '<span class="dn">'+name+(sub?(' <span class="dn-sub">'+sub+'</span>'):'')+'</span>'
        + tagHtml
        + '<span class="da">'+money(totalDollars/1e6)+'</span>'
      + '</button>';
    if(has){
      H += '<div class="dept-group" id="'+id+'" role="region" aria-labelledby="'+id+'b">';
      items.forEach(function(it){
        H += '<div class="dept-line"><span class="dl-name">'+it.name+'</span><span class="dl-amt">'+usd(it.amt)+'</span></div>';
      });
      H += '</div>';
    }
    H += '</div>';
  }
  PROTECTED.forEach(function(p){ catBlock(p.name, p.note, '<span class="tag ps">Protected</span>', p.amt, null); });
  CUT_GROUPS.forEach(function(g){ catBlock(g.name, null, '<span class="tag np">Cuttable</span>', g.total, g.items); });
  dl.innerHTML = H;
  document.querySelectorAll('#deptList .dept-btn:not(.no-exp)').forEach(function(btn){
    btn.addEventListener("click", function(){
      var c = document.getElementById(btn.getAttribute("aria-controls")); if(!c) return;
      var exp = btn.getAttribute("aria-expanded")==="true";
      btn.setAttribute("aria-expanded", String(!exp));
      c.classList.toggle("open", !exp);
    });
  });

  }
  if(document.getElementById("mixSlider")){
  // ---------- tradeoff calculator (cuts vs new revenue) ----------
  var slider = document.getElementById("mixSlider");
  var mixReadout = document.getElementById("mixReadout");
  var cutAmtEl = document.getElementById("cutAmt");
  var cutSubEl = document.getElementById("cutSub");
  var cutListEl = document.getElementById("cutList");
  var taxAmtEl = document.getElementById("taxAmt");
  var taxSubEl = document.getElementById("taxSub");
  var taxListEl = document.getElementById("taxList");
  var meanCutHead = document.getElementById("meanCutHead");
  var meanCutList = document.getElementById("meanCutList");
  var meanTaxHead = document.getElementById("meanTaxHead");
  var meanTaxList = document.getElementById("meanTaxList");
  var cutPoolM = CUT_TOTAL/1e6; // ~$692.5M of non-protected spending

  function update(){
    var taxShare = parseInt(slider.value,10)/100;   // 0..1 toward taxes
    var cutShare = 1 - taxShare;
    var cutDollars = GAP * cutShare;                 // $M closed by cuts (pool > GAP, so always reachable)
    var taxDollars = GAP * taxShare;
    var cutPct = Math.round(cutShare*100), taxPct = 100 - cutPct;
    mixReadout.innerHTML = "Closing <b>"+cutPct+"%</b> with service cuts and <b>"+taxPct+"%</b> with new taxes &amp; fees";
    slider.setAttribute("aria-valuetext", cutPct+" percent service cuts, "+taxPct+" percent new taxes and fees");

    // ---- CUTS side: proportional draw across the non-protected categories ----
    cutAmtEl.textContent = money(cutDollars);
    cutSubEl.textContent = cutDollars < 0.05
      ? "No cuts at this setting"
      : "drawn from the " + money(cutPoolM) + " of non-protected spending";
    var cHTML = "";
    if(cutDollars < 0.05){
      cHTML = '<li><span>No cuts at this setting</span><span class="ci">$0</span></li>';
    } else {
      var frac = cutDollars / cutPoolM;
      CUT_GROUPS.forEach(function(g){
        var share = (g.total/1e6) * frac;
        cHTML += '<li><span>'+g.name+'</span><span class="ci">&minus;'+money(share)+'</span></li>';
      });
      cHTML += '<li class="total-row"><span>Total from cuts</span><span class="ci">&minus;'+money(cutDollars)+'</span></li>';
    }
    cutListEl.innerHTML = cHTML;

    // ---- TAX side ----
    taxAmtEl.textContent = money(taxDollars);
    taxSubEl.textContent = "New revenue the City would have to raise";
    var surtaxPennies = taxDollars / SURTAX_PENNY;
    var addedMills = taxDollars / REV_PER_MILL;
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
    meanCutHead.textContent = cutDollars < 0.05
      ? "No service or program cuts at this setting"
      : "About " + money(cutDollars) + " cut from city programs and services";
    var mcHTML = "";
    if(cutDollars < 0.05){
      mcHTML = '<li><span class="ihead">No cuts at this setting</span><span class="idetail">Move the slider left to close more of the gap through cuts.</span></li>';
    } else {
      serviceImpacts.forEach(function(s){
        mcHTML += '<li><span class="ihead">'+s.headline+'</span><span class="idetail">'+s.detail+'</span></li>';
      });
      mcHTML += '<li><span class="ihead">Much of it is one-time money</span><span class="idetail">A large share of non-protected spending (grants, incentives, contingencies, one-time transfers) is nonrecurring, so cutting it closes the gap once but not for the years that follow.</span></li>';
    }
    meanCutList.innerHTML = mcHTML;

    // ---- MEANING: tax side ----
    var addedRate = (surtaxPennies/100);
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
  if(document.getElementById("byoGroups")){
  // ============ BUILD YOUR OWN BUDGET (grouped, expandable) ============
  var groupsEl = document.getElementById("byoGroups");
  var protEl   = document.getElementById("byoProtected");
  var byoClosedEl = document.getElementById("byoClosed");
  var byoFillEl   = document.getElementById("byoFill");
  var byoBarEl    = document.getElementById("byoBar");
  var byoStatusEl = document.getElementById("byoStatus");
  var byoNoteEl   = document.getElementById("byoNote");
  var byoResetBtn = document.getElementById("byoReset");
  var poolM = CUT_TOTAL/1e6;

  // protected (read-only)
  var pHTML = "";
  PROTECTED.forEach(function(p){
    pHTML += '<div class="byo-prot-row"><span class="bp-name">'+p.name+'<span class="bp-note">'+p.note+'</span></span>'
      + '<span class="bp-amt">'+money(p.amt/1e6)+'</span></div>';
  });
  protEl.innerHTML = pHTML;

  // dollars cut from a group = sum of its positive line-item cuts, capped at the category's net budget
  function groupCut(g){
    var c = 0; g.items.forEach(function(it){ if(it.amt > 0) c += it.amt * (it.frac || 0); });
    return Math.min(c, g.total);
  }

  // cuttable groups: a category master slider + expandable per-line-item sliders (sorted high to low)
  CUT_GROUPS.forEach(function(g, gi){
    g.items.forEach(function(it){ it.frac = 0; });
    var sorted = g.items.slice().sort(function(a,b){ return b.amt - a.amt; });

    var wrap = document.createElement("div"); wrap.className = "byo-grp";
    var head = document.createElement("div"); head.className = "byo-grp-head";
    head.innerHTML = '<button class="byo-grp-exp" type="button" aria-expanded="false" aria-controls="bgi'+gi+'" aria-label="Show line items for '+g.name+'"><span class="chev" aria-hidden="true">&#9654;</span></button>'
      + '<span class="bg-name">'+g.name+'</span>'
      + '<span class="bg-total">'+money(g.total/1e6)+'</span>';
    wrap.appendChild(head);

    var master = document.createElement("input");
    master.type = "range"; master.className = "byo-slider";
    master.min = 0; master.max = 100; master.step = 1; master.value = 0;
    master.setAttribute("aria-label", "Cut a percentage of all "+g.name);
    wrap.appendChild(master);

    var foot = document.createElement("div"); foot.className = "byo-adj-foot";
    var lvl = document.createElement("span"); lvl.className = "funded-lvl";
    var cutl = document.createElement("span"); cutl.className = "cut-lvl none";
    foot.appendChild(lvl); foot.appendChild(cutl); wrap.appendChild(foot);

    var det = document.createElement("div"); det.className = "byo-grp-items"; det.id = "bgi"+gi;
    sorted.forEach(function(it){
      if(it.amt > 0){
        var row = document.createElement("div"); row.className = "byo-item-row";
        var top = document.createElement("div"); top.className = "bir-top";
        top.innerHTML = '<span class="bir-name">'+it.name+'</span><span class="bir-amt">'+usd(it.amt)+'</span>';
        row.appendChild(top);
        var is = document.createElement("input");
        is.type = "range"; is.className = "byo-slider byo-slider-sm";
        is.min = 0; is.max = 100; is.step = 1; is.value = 0;
        is.setAttribute("aria-label", "Percent of "+it.name+" to cut");
        is.addEventListener("input", function(){ it.frac = parseInt(is.value,10)/100; syncMaster(); refreshGroup(); tally(); });
        it._slider = is;
        row.appendChild(is);
        det.appendChild(row);
      } else {
        var r2 = document.createElement("div"); r2.className = "dept-line";
        r2.innerHTML = '<span class="dl-name">'+it.name+' <em class="dl-note">(budgeted lapse &mdash; not cuttable)</em></span><span class="dl-amt">'+usd(it.amt)+'</span>';
        det.appendChild(r2);
      }
    });
    wrap.appendChild(det);

    function refreshGroup(){
      var gm = g.total/1e6, cut = groupCut(g)/1e6;
      lvl.textContent = money(Math.max(0, gm - cut)) + " funded";
      if(cut < 0.05){ cutl.textContent = "fully funded"; cutl.className = "cut-lvl none"; }
      else { cutl.textContent = "cut "+money(cut)+" ("+Math.round(cut/gm*100)+"%)"; cutl.className = "cut-lvl"; }
    }
    function syncMaster(){ master.value = Math.round(Math.min(100, groupCut(g)/g.total*100)); }

    master.addEventListener("input", function(){
      var v = parseInt(master.value,10)/100;
      g.items.forEach(function(it){ if(it.amt > 0){ it.frac = v; if(it._slider){ it._slider.value = master.value; } } });
      refreshGroup(); tally();
    });
    head.querySelector(".byo-grp-exp").addEventListener("click", function(){
      var exp = this.getAttribute("aria-expanded")==="true";
      this.setAttribute("aria-expanded", String(!exp));
      det.classList.toggle("open", !exp);
    });
    g._master = master; g._refreshGroup = refreshGroup; refreshGroup();
    groupsEl.appendChild(wrap);
  });

  function tally(){
    var closed = 0; CUT_GROUPS.forEach(function(g){ closed += groupCut(g); });
    var closedM = closed/1e6, pct = Math.min(100, closedM/GAP*100);
    byoClosedEl.textContent = money(closedM);
    byoFillEl.style.width = pct + "%";
    byoBarEl.setAttribute("aria-valuenow", closedM.toFixed(1));
    var remaining = GAP - closedM;
    if(closedM >= GAP - 0.05){
      byoFillEl.classList.add("green"); byoStatusEl.classList.add("win");
      byoStatusEl.textContent = "You've reached $283.2M — on paper. See the note below on why that isn't a durable fix.";
    } else {
      byoFillEl.classList.remove("green"); byoStatusEl.classList.remove("win");
      byoStatusEl.textContent = money(remaining) + " still to close.";
    }
    var anyCut = CUT_GROUPS.some(function(g){ return groupCut(g) > 50000; });
    byoNoteEl.innerHTML = anyCut
      ? "There is about "+money(poolM)+" of non-protected spending to draw from, so the $283.2M can be reached — but it means permanently ending programs like indigent care, grants, libraries, and parks."
      : "There is about "+money(poolM)+" of non-protected spending outside public safety, debt, and pensions. Move a category slider, or expand a category and cut individual line items.";
  }

  byoResetBtn.addEventListener("click", function(){
    CUT_GROUPS.forEach(function(g){
      g.items.forEach(function(it){ it.frac = 0; if(it._slider){ it._slider.value = 0; } });
      if(g._master){ g._master.value = 0; }
      if(g._refreshGroup){ g._refreshGroup(); }
    });
    tally();
  });
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

// Civic action ladder: defined once here, injected above the footer on every page.
(function(){
  var footer = document.querySelector("footer");
  if(!footer || document.querySelector(".action-ladder")) return;
  var html =
    '<section class="action-ladder" aria-label="How to get involved">'
    + '<div class="inner">'
    + '<h2 class="al-title">Understand the tradeoff, then take the next step</h2>'
    + '<p class="al-sub">This is civic education, not a campaign. The aim is simply that more Jacksonville residents understand the tradeoff before they decide.</p>'
    + '<ol class="al-steps">'
    + '<li><span class="al-num">1</span><div class="al-body"><span class="al-h">Run the budget test</span>'
    + '<span class="al-d">See whether you can close the $283M gap with cuts, new revenue, or a mix.</span></div>'
    + '<a class="al-go" href="calculators.html">Open &rarr;</a></li>'
    + '<li><span class="al-num">2</span><div class="al-body"><span class="al-h">Share your result with one neighbor</span>'
    + '<span class="al-d">A single conversation does more than a statistic.</span></div></li>'
    + '<li><span class="al-num">3</span><div class="al-body"><span class="al-h">Download the one-page impact brief</span>'
    + '<span class="al-d">A printable one-page summary of the numbers.</span></div>'
    + '<a class="al-go" href="brief.html">Open &rarr;</a></li>'
    + '<li><span class="al-num">4</span><div class="al-body"><span class="al-h">Request a presentation</span>'
    + '<span class="al-d">For your neighborhood, civic group, or business association.</span></div>'
    + '<a class="al-go" href="mailto:connor@jaxciviccouncil.com?subject=Presentation%20request">Email &rarr;</a></li>'
    + '<li><span class="al-num">5</span><div class="al-body"><span class="al-h">Check the ballot date and make a voting plan</span>'
    + '<span class="al-d">The amendment would go before Florida voters at the next general election.</span></div></li>'
    + '</ol></div></section>';
  footer.insertAdjacentHTML("beforebegin", html);
})();
