let InfinityPrestigeLayer = {
  canInfinityBeBroken() {
    return Challenge.areAllChallengesCompleted();
  },
  isBreakInfinityOn() {
    // Don't credit the player with breaking infinity if they couldn't have done it.
    return this.canInfinityBeBroken() && player.breakInfinity;
  },
  isInfinityBroken() {
    return this.isBreakInfinityOn() && Challenge.isNoChallengeRunning() &&
      InfinityChallenge.isNoInfinityChallengeRunning();
  },
  breakInfinityButtonText() {
    return player.breakInfinity ?
      ('修复无限：强制在' + format(Decimal.pow(2, 256)) + '星辰进行无限重置') :
      ('打破无限：允许星辰超过' + format(Decimal.pow(2, 256)) + '，获得更多无限点数');
  },
  toggleBreakInfinity() {
    if (this.canInfinityBeBroken()) {
      player.breakInfinity = !player.breakInfinity;
    }
  },
  starRequirementForInfinity() {
    if (InfinityChallenge.isSomeInfinityChallengeRunning()) {
      return InfinityChallenge.getInfinityChallengeGoal(InfinityChallenge.currentInfinityChallenge());
    } else {
      return Decimal.pow(2, 256);
    }
  },
  canInfinity() {
    return this.bestStarsThisInfinity().gte(this.starRequirementForInfinity());
  },
  mustInfinity() {
    return this.canInfinity() && !this.isInfinityBroken();
  },
  isRequirementVisible() {
    return !this.canInfinity();
  },
  isAmountSpanVisible() {
    return this.isRequirementVisible() && PrestigeLayerProgress.hasReached('infinity');
  },
  bestStarsThisInfinity() {
    return player.stats.bestStarsThisInfinity;
  },
  infinityPointGain() {
    if (!this.canInfinity()) {
      return new Decimal(0);
    }
    let oom = (this.isInfinityBroken() ? this.bestStarsThisInfinity() : this.starRequirementForInfinity()).max(1).log(2) / 256;
    return Decimal.pow(2, oom).floor();
  },
  infinityPoints() {
    return InfinityPoints.amount();
  },
  newInfinityPoints() {
    return this.infinityPoints().plus(this.infinityPointGain());
  },
  totalInfinityPoints() {
    return InfinityPoints.totalIPProducedThisEternity();
  },
  newTotalInfinityPoints() {
    return this.totalInfinityPoints().plus(this.infinityPointGain());
  },
  infinityPointGainRatio() {
    return this.infinityPointGain().div(this.totalInfinityPoints());
  },
  infinityPointGainRatioText() {
    if (this.totalInfinityPoints().neq(0)) {
      return '一共' + format(this.infinityPointGainRatio()) + '倍，';
    } else {
      return '';
    }
  },
  infinityPointNext() {
    return Decimal.pow(this.infinityPointGain().plus(1), 256);
  },
  infinityPointNextText() {
    if (this.infinityPointGain().lt(256)) {
      return '，下次需要' + format(this.infinityPointNext()) + '星辰';
    } else {
      return '';
    }
  },
  currentIPPerSec() {
    // This Math.max is here to prevent issues with gain after 0 seconds from starting benefits.
    return this.infinityPointGain().div(Math.max(player.stats.timeSinceInfinity, 1 / 16));
  },
  currentLogIPPerSec() {
    return Stats.getLogPerSec(player.stats.timeSinceInfinity, this.infinityPointGain(), this.totalInfinityPoints(), false);
  },
  currentLogIPPerSecDisplay() {
    return Stats.getLogPerSec(player.stats.timeSinceInfinity, this.infinityPointGain(), this.totalInfinityPoints(), true);
  },
  peakIPPerSec() {
    return player.stats.peakIPPerSec;
  },
  peakLogIPPerSec() {
    return player.stats.peakLogIPPerSec;
  },
  peakLogIPPerSecDisplay() {
    return this.peakLogIPPerSec() / Math.log2(NotationOptions.exponentBase());
  },
  updatePeakIPPerSec() {
    let cps = this.currentIPPerSec();
    if (this.canInfinity() && cps.gt(player.stats.peakIPPerSec)) {
      player.stats.peakIPPerSec = cps;
      player.stats.timeSinceLastPeakIPPerSec = 0;
    }
  },
  updatePeakLogIPPerSec() {
    let cps = this.currentLogIPPerSec();
    if (this.canInfinity() && cps >= player.stats.peakLogIPPerSec) {
      player.stats.peakLogIPPerSec = cps;
      player.stats.timeSinceLastPeakLogIPPerSec = 0;
    }
  },
  showLog(x) {
    let setting = Options.showLogSetting(x);
    if (setting === 'Default') {
      return Autobuyer(12).hasAutobuyer() && ['Time past peak log/sec', 'Fraction of peak log/sec'].includes(Autobuyer(12).mode());
    } else if (setting === 'Off') {
      return false;
    } else if (setting === 'On') {
      return true;
    }
  },
  compareIPGain() {
    if (this.infinityPointGain().lt(this.infinityPoints())) {
      player.stats.timeSinceIPGainWasAmount = 0;
    }
    if (this.infinityPointGain().lt(this.totalInfinityPoints())) {
      player.stats.timeSinceIPGainWasTotal = 0;
    }
  },
  infinityConfirmationMessage() {
    let gain = this.infinityPointGain();
    return '您确定要进行无限重置，并获得' +
    formatInt(gain) + '无限点数' + pluralize(gain, '', '') + '吗？';
  },
  infinityResetConfirmationMessage() {
    return '您确定要进行无限强制重置吗？您不会获得任何无限点数。';
  },
  infinity(manual, newLimit) {
    if (!this.canInfinity()) return;
    if (manual && Options.confirmation('infinity') && !confirm(this.infinityConfirmationMessage())) return;
    // 1 is the number of new infinities (as opposed to EC autocomplete which doesn't itself give infinities,
    // but does lower the allowed number of infinities).
    if (EternityChallenge.checkForExitingEternityChallenge4(1)) {
      // If this returns true, we exited.
      return;
    }
    Achievements.checkForAchievements('infinity');
    let gain = this.infinityPointGain();
    let amount = this.infinityPoints();
    InfinityPoints.addAmount(gain);
    Infinities.increment();
    ComplexityAchievements.checkForComplexityAchievements('infinity');
    Stats.addInfinity(player.stats.timeSinceInfinity, gain, amount);
    Challenge.checkForChallengeCompletion();
    InfinityChallenge.checkForInfinityChallengeCompletion();
    if (!Challenge.restartOnCompletion()) {
      Challenge.setChallenge(0);
    }
    if (!InfinityChallenge.restartOnCompletion()) {
      InfinityChallenge.setInfinityChallenge(0);
    }
    Goals.recordPrestige('infinity');
    this.infinityReset(false, newLimit);
  },
  infinityReset(manual, newLimit) {
    if (manual && Options.confirmation('infinity') && !confirm(this.infinityResetConfirmationMessage())) return;
    Prestige.prestigeReset(true, newLimit);
    player.prestigePower = new Decimal(1);
    player.infinityStars = new Decimal(1);
    InfinityGenerators.list.forEach(x => x.resetAmount());
    player.stats.bestStarsThisInfinity = Stars.amount();
    player.stats.timeSinceInfinity = 0;
    player.stats.timeSinceLastPeakIPPerSec = Math.pow(2, 256);
    player.stats.timeSinceLastPeakLogIPPerSec = Math.pow(2, 256);
    player.stats.timeSinceIPGainWasAmount = 0;
    player.stats.timeSinceIPGainWasTotal = 0;
    player.stats.peakIPPerSec = new Decimal(0);
    player.stats.peakLogIPPerSec = 0;
    player.stats.purchasesThisInfinity = 0;
    player.stats.purchasesThisInfinityByType = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    player.stats.sacrificesThisInfinity = 0;
    player.stats.prestigesThisInfinity = 0;
  }
}
