let ChallengeHeaderText = {
  getCurrentChallengesText() {
    // Don't include 1.
    let runningComplexityChallenges = [2, 3, 4, 5, 6].filter(x => ComplexityChallenge.isComplexityChallengeRunning(x));
    let challenges = [
      Challenge.isSomeChallengeRunning() ? '通常挑战' + formatOrdinalInt(Challenge.currentChallenge()) : null,
      InfinityChallenge.isSomeInfinityChallengeRunning() ? '无限挑战' + formatOrdinalInt(InfinityChallenge.currentInfinityChallenge()) : null,
      EternityChallenge.isSomeEternityChallengeRunning() ? '永恒挑战' + formatOrdinalInt(EternityChallenge.currentEternityChallenge()) : null,
      runningComplexityChallenges.length > 0 ?
      '繁复挑战' + pluralize(runningComplexityChallenges.length, '', '') + '' + coordinate('*', '', runningComplexityChallenges.map(formatOrdinalInt)) : null
    ];
    return coordinate('您目前在进行*。', '您目前未进行任何挑战。', challenges);
  },
  getNextCCCompletionText() {
    let minRunningComplexityChallengeGoal = [1, 2, 3, 4, 5, 6].filter(
      x => ComplexityChallenge.isComplexityChallengeRunning(x)).map(
      x => ComplexityChallenge.getComplexityChallengeGoal(x)).reduce(
      (x, y) => Decimal.min(x, y));
    return '达到' + format(minRunningComplexityChallengeGoal) + '星辰后可以完成下一阶层繁复挑战。';
  },
  getText() {
    let texts = [];
    if (PrestigeLayerProgress.hasReached('infinity') && Options.showCurrentChallenges()) {
      texts.push(this.getCurrentChallengesText());
    }
    if (PrestigeLayerProgress.hasReached('complexity') && Options.showNextCCCompletion()) {
      texts.push(this.getNextCCCompletionText());
    }
    return texts.map(i => '' + i).join('');
  }
}
