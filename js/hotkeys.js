let toggleDown = false;
let globalShiftDown = false;
let lastTogglePress = null;
let lastShiftPress = null;
let lastHotkeyUse = {
  'infinity': -Infinity,
  'eternity': -Infinity,
  'complexity': -Infinity,
  'finality': -Infinity
}

let updateHotkeys = function () {
  // If either shift or T has been held for about a minute, unhold it.
  if (globalShiftDown && (Date.now() - lastShiftPress) / 1000 >= 64) {
    globalShiftDown = false;
  }
  if (toggleDown && (Date.now() - lastTogglePress) / 1000 >= 64) {
    toggleDown = false;
  }
}

let codeToAutobuyers = {
  49: 1,
  50: 2,
  51: 3,
  52: 4,
  53: 5,
  54: 6,
  55: 7,
  56: 8,
  97: 1,
  98: 2,
  99: 3,
  100: 4,
  101: 5,
  102: 6,
  103: 7,
  104: 8,
  65: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  66: 9,
  67: 15,
  69: 13,
  70: 16,
  71: [1, 2, 3, 4, 5, 6, 7, 8],
  73: 12,
  77: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  80: 11,
  82: 14,
  83: 10,
};

// We need to avoid referencing things that might not exist yet due to not all scripts having run.
let HotkeyMaxAll = {
  things: [
    {
      purchase: list => MaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      upgrades: [9],
      tab: 'main'
    },
    {
      purchase: list => InfinityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      upgrades: [9, 10],
      tab: 'infinity'
    },
    // This is mostly irrelevant since we only show the player this once they reach infinity,
    // and they can easily buy all slow generators by then (and never lose them),
    // but we include it for completeness.
    {
      purchase: function (list) {
        for (let i of list) {
          Autobuyer(i).unlockSlow();
        }
      },
      unlocks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      tab: 'autobuyers'
    },
    {
      purchase: list => EternityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      upgrades: [9, 10, 11],
      tab: 'eternity'
    },
    // We deviate slightly from tab order to do things in the same order
    // as the autobuyer code. This *does* mean that if you can unlock the eternity producer
    // and also can afford upgrades for it, it'll take a second tick/M press to get the upgrades,
    // but I'm pretty worried about consequences of changing this order so I'm going to leave it.
    {
      purchase: list => EternityMaxAll.maxAll(list),
      upgrades: [12, 13],
      tab: 'eternity-producer'
    },
    {
      purchase: list => EternityMaxAll.maxAll(list),
      upgrades: [14, 15, 16],
      tab: 'studies'
    },
    {
      purchase: list => EternityMaxAll.maxAll(list),
      upgrades: [17, 18, 19, 20],
      tab: 'eternity-producer'
    },
    // This "true" means "via autobuyer". It's likely that,
    // if a player is using this, they're just mindlessly holding M,
    // so we should treat this similarly to an automatic unlock.
    {
      purchase: () => EternityProducer.unlock(true),
      type: 'unlock',
      tab: 'eternity-producer'
    },
    {
      purchase: function (list) {
        for (let i of list) {
          Chroma.unlockColor(i, true);
        }
      },
      unlocks: [1, 2, 3, 4, 5, 6],
      tab: 'chroma'
    },
    {
      purchase: list => ComplexityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      tab: 'complexity'
    },
    {
      purchase: list => ComplexityMaxAll.maxAll(list),
      upgrades: [9, 10, 11, 12, 13, 14, 15],
      tab: 'powers'
    },
    {
      purchase: () => Powers.unlock(true),
      type: 'unlock',
      tab: 'powers'
    },
    {
      purchase: () => Oracle.unlock(true),
      type: 'unlock',
      tab: 'oracle'
    },
    {
      purchase: () => Galaxy.unlock(true),
      type: 'unlock',
      tab: 'galaxies'
    },
    {
      purchase: list => FinalityMaxAll.maxAll(list),
      generators: [1, 2, 3, 4, 5, 6, 7, 8],
      tab: 'finality'
    },
    {
      purchase: list => FinalityShards.maxAll(list),
      upgrades: [1, 2, 3, 4, 5, 6, 7, 8],
      tab: 'finality-shards'
    },
  ],
  trigger(fullMaxAll) {
    let types = fullMaxAll ?
      (Options.maxAllMode() === 'All generators, upgrades, and unlocks' ?
      ['generators', 'upgrades', 'unlocks'] : ['generators', 'upgrades']) :
      ['generators'];
    let tabs = {
      'Normal generators and boosts': ['main'],
      'Generators and upgrades in current tab': [Tabs.currentTab()],
      'Both': ['main', Tabs.currentTab()],
      'All generators and upgrades': 'all',
      'All generators, upgrades, and unlocks': 'all'
    }[Options.maxAllMode()];
    for (let i of this.things) {
      if (tabs === 'all' || tabs.includes(i.tab)) {
        if ('type' in i) {
          if (types.includes(i.type + 's')) {
            i.purchase();
          }
        } else {
          let l = [];
          for (let t of types) {
            if (t in i) {
              l = l.concat(i[t]);
            }
          }
          // This needs to go outside the above for loop to stop intermediate buying of things
          // (e.g. buying generators before boosts, when generators are generally less valuable than boosts).
          // You might think this would go without saying, but apparently it was originally in the for loop, which
          // unsurprisingly caused bugs.
          // I'm not sure if not sorting would lead to buying things in the wrong order, but better safe than sorry.
          l.sort();
          i.purchase(l);
        }
      }
    }
  }
}

window.addEventListener('keydown', function(event) {
  let controlDown = event.ctrlKey || event.metaKey;
  let shiftDown = event.shiftKey;
  if ((player && !player.options.hotkeys) || controlDown || (document.activeElement && document.activeElement.type === 'text')) return false;
  const tmp = event.keyCode;
  if (toggleDown) {
    if (tmp in codeToAutobuyers) {
      Autobuyers.toggleSome(codeToAutobuyers[tmp]);
    }
    return;
  }
  if ((tmp >= 49 && tmp <= 56) || (tmp >= 97 && tmp <= 104)) {
    let gen = tmp % 48;
    if (shiftDown) {
      Generator(gen).buy();
    } else {
      Generator(gen).buyMax();
    }
    return false;
  }
  switch (tmp) {
    case 16: // shift
      globalShiftDown = true;
      lastShiftPress = Date.now();
    break;
    
    case 37: // left
      Tabs.move(false, globalShiftDown);
    break;
    
    case 39: // right
      Tabs.move(true, globalShiftDown);
    break;
    
    case 65: // A
      if (shiftDown) {
        Autobuyers.toggleAll();
      } else {
        Autobuyers.turnAllOnOrOff();
      }
    break;

    case 66: // B
      if (shiftDown) {
        Boost.buy();
      } else {
        Boost.buyMax();
      }
    break;

    case 67: // C
      ComplexityPrestigeLayer.complexity(true);
      lastHotkeyUse.complexity = Date.now() / 1000;
    break;

    case 69: // E, also, nice
      if (shiftDown) {
        EternityChallenge.respecAndReset();
      } else {
        EternityPrestigeLayer.eternity(true);
      }
      lastHotkeyUse.eternity = Date.now() / 1000;
    break;

    case 70: // F
      if (shiftDown) {
        FinalityShardPresets.respecAndReset();
      } else {
        FinalityPrestigeLayer.finality(true);
      }
      lastHotkeyUse.finality = Date.now() / 1000;
    break;
    
    case 71: // G
      HotkeyMaxAll.trigger(false);
    break;

    case 73: // I
      InfinityPrestigeLayer.infinity(true, null);
      lastHotkeyUse.infinity = Date.now() / 1000;
    break;

    case 77: // M
      HotkeyMaxAll.trigger(true);
    break;

    case 79: // O
      Oracle.invoke();
    break;

    case 80: // P
      if (shiftDown) {
        Powers.respecAndReset();
      } else {
        Prestige.prestige(true);
      }
    break;
    
    case 82: // R
      Permanence.gainPermanence(true);
    break;

    case 83: // S
      if (shiftDown) {
        Studies.respecAndReset();
      } else {
        Sacrifice.sacrifice(true);
      }
    break;
    
    case 84: // T
      toggleDown = true;
      lastTogglePress = Date.now();
    break;
    
    case 8 * 11: // X
      ChallengeExitOrRestart.exitChallenge();
    break;
    
    case 89: // Y
      ChallengeExitOrRestart.restartChallenge();
    break;
  }
}, false);

window.addEventListener('keyup', function(event) {
  // This is slightly over-engineered, but it's for symmetry.
  let controlDown = event.ctrlKey || event.metaKey;
  let shiftDown = event.shiftKey;
  if ((player && !player.options.hotkeys) || controlDown || (document.activeElement && document.activeElement.type === 'text')) return false;
  const tmp = event.keyCode;
  switch (tmp) {
    case 16: // shift
      globalShiftDown = false;
    break;
    
    case 84: // T
      toggleDown = false;
    break;
  }
}, false);

let Hotkeys = {
  criteria: function() {
    // There's some inconsistency here, in that the prestige hotkey is visible as soon as prestige is visible
    // (even if not reached), but later hotkeys are only visible when reached. I think it's justifiable,
    // because in the early game it's good to show future content (unless there's so much it will scare people,
    // which isn't the case here) and to show that there are hotkeys for it.
    return [
      true, SpecialDivs.isDivVisible('boosts'), SpecialDivs.isDivVisible('sacrifice'), SpecialDivs.isDivVisible('prestige'),
      PrestigeLayerProgress.hasReached('infinity') || InfinityPrestigeLayer.canInfinity(),
      PrestigeLayerProgress.hasReached('eternity') || EternityPrestigeLayer.canEternity(),
      PrestigeLayerProgress.hasReached('eternity'),
      PrestigeLayerProgress.hasReached('complexity') || EternityProducer.isUnlocked(),
      PrestigeLayerProgress.hasReached('complexity') || EternityChallenge.areEternityChallengesVisible(),
      PrestigeLayerProgress.hasReached('complexity') || ComplexityPrestigeLayer.canComplexity(),
      PrestigeLayerProgress.hasReached('finality') || Powers.isUnlocked(),
      PrestigeLayerProgress.hasReached('finality') || Oracle.isUnlocked(),
      PrestigeLayerProgress.hasReached('finality') || FinalityPrestigeLayer.canFinality(),
      PrestigeLayerProgress.hasReached('finality')
    ];
  },
  eachText: function () {
    let oneToEight = formatOrdinalInt(1) + '-' + formatOrdinalInt(8);
    return [
      '按下1-8键以最大化购买相应的发生器' + oneToEight + '，按住Shift键再按下1-8键以购买一个相应的发生器' +
      '' + oneToEight + '，按下G键以购买所有的~g~，按下M键以购买所有的~g~和推进，' +
      '按下A键以切换所有自动购买器的开关，按住Shift键再按下A键以使所有自动购买器的开关反转',
      '按下B键以最大化购买推进，按住Shift键再按下B键以购买一个推进', '按下S键以进行献祭', '按下P键以进行转生',
      '按下I键以进行无限重置，按下X键以退出挑战，按下Y键以重新开始挑战(退出并重新进入)',
      '按下E键以进行永恒重置', '按住Shift键再按下S键以洗点课题并进行永恒重置',
      '按下R键以获得持久', '按住Shift键再按下E键以洗点永恒挑战并进行永恒重置', '按下C键以进行繁复重置',
      '按住Shift键再按下P键以解除装备能力并进行繁复重置', '按下O键以获得神谕的预测结果',
      '按下F键以进行终焉重置', '按下Shift键再按下F键以洗点终焉碎片升级并进行终焉重置'
    ];
  },
  listText: function () {
    let criteria = this.criteria();
    // This join-then-split thing is very important if the first item of the list,
    // which has commas in it, is the only item (that is, before you can prestige).
    let parts = this.eachText().filter((_, i) => criteria[i]).join('，').split('，');
    parts[parts.length - 1] = '且' + parts[parts.length - 1];
    return parts.join('，').replace(/~g~/g, Generators.term());
  }
};
