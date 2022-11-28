let Permanence = {
  getRequiredEternities() {
    return this.getEternitiesPerPermanence().plus(this.getLeftoverEternities());
  },
  getLeftoverEternities() {
    return 16;
  },
  getTotalPermanenceMultiplier() {
    return PermanenceUpgrade(4).effect().times(Complexities.permanenceMultiplier()).times(FinalityShardUpgrade(3).effect());
  },
  getEternitiesPerPermanence() {
    return Decimal.pow(2, 24).div(this.getTotalPermanenceMultiplier());
  },
  conversionText() {
    let eternitiesPer = this.getEternitiesPerPermanence();
    if (eternitiesPer.gt(1)) {
      return '每' + format(eternitiesPer) + '次永恒获得' + formatInt(1) + '持久';
    } else {
      return '每次永恒获得' + format(Decimal.div(1, eternitiesPer)) + '持久';
    }
  },
  hasPassiveProduction() {
    return FinalityMilestones.isFinalityMilestoneActive(5);
  },
  productionPerSecondText() {
    let template;
    let perSecond;
    if (this.hasPassiveProduction()) {
      template = '由于终焉里程碑' + formatInt(5) + '的效果，您*。';
      perSecond = this.permanenceGain();
    } else {
      template = '您的永恒次数产量转换为*。';
      perSecond = EternityProducer.productionPerSecond().div(this.getEternitiesPerPermanence());
    }
    let perSecondText;
    if (perSecond.gte(1) || perSecond.eq(0)) {
      perSecondText = '每秒获得' + format(perSecond) + '持久';
    } else {
      // Note that perSecond can't ever be small enough for this to convert a Decimal
      // to Infinity without being actually 0 (it's not even close;
      // perSecond's minimum is something like 1e-7).
      perSecondText = '每' + formatTime(Decimal.div(1, perSecond).toNumber(),{seconds: {f: formatTimeNum, s: false}, larger: {f: formatTimeNum, s: false}}) + '获得' + formatInt(1) + '持久';
    }
    return template.replace('*', perSecondText);
  },
  canGainPermanence() {
    // We don't use Permanence.getRequiredEternities() since that's often rounded to
    // the leftover eternities with good enough conversion.
    return EternityProducer.isUnlocked() && Eternities.amount().minus(this.getLeftoverEternities()).gte(this.getEternitiesPerPermanence());
  },
  permanenceGain() {
    if (!this.canGainPermanence()) {
      return new Decimal(0);
    }
    return Eternities.amount().minus(this.getLeftoverEternities()).div(this.getEternitiesPerPermanence());
  },
  hasGainedPermanence() {
    return player.hasGainedPermanence;
  },
  gainPermanenceConfirmationMessage() {
    return '您确定要获得' + format(Permanence.permanenceGain()) +
    '持久吗？您将只保留' + formatInt(Permanence.getLeftoverEternities()) +
    '次永恒，但不会失去其他任何东西。';
  },
  gainPermanence(manual) {
    if (!this.canGainPermanence()) return;
    if (manual && Options.confirmation('permanence') && !confirm(this.gainPermanenceConfirmationMessage())) return;
    Achievements.checkForAchievements('permanence');
    player.hasGainedPermanence = true;
    let gain = this.permanenceGain();
    player.stats.lastPermanenceGain = gain;
    player.stats.timeSincePermanenceGain = 0;
    this.add(gain);
    Eternities.setAmount(this.getLeftoverEternities());
  },
  amount() {
    return player.permanence;
  },
  add(x) {
    player.permanence = player.permanence.plus(x);
  },
  safeSubtract(x) {
    player.permanence = player.permanence.safeMinus(x);
  },
  anythingToBuy() {
    return PermanenceUpgrades.list.some(x => x.canBuy());
  },
  maxAll() {
    this.buyMaxOf([1, 2, 3, 4])
  },
  buyMaxOf(ids) {
    let list = ids.map(x => PermanenceUpgrades.list[x - 1]);
    generalMaxAll(list, Permanence);
  }
}
