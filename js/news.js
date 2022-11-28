let News = {
  messages: [
    'You can disable those messages in options. But I guess you know that, since you enabled them.',
    'Click this for a nonexistent secret achievement.',
    'can i just say that I\'m against news tickers',
    'help im trapped in a news ticker factory',
    'Hello you are playing FE00000. The news ticker factory didn\'t have enough budget for the extra 0.',
    'Imagine if these things scrolled across the screen. Then presumably they could be way longer.',
    'Need some help? Check the guide in the Options tab!',
    'Star Trek: The Next Generators',
    () => format(Stars.amount()) + '星辰？新手才只有这么点数字，让数字继续涨上去！',
    'Lemme get some Dimbo- Boosts',
    'FE000000 lore when?',
    () => '发生器' + formatOrdinalInt(9) + '的玩笑才不存……哦等等',
    '\'Will there be new content?\' -everyone at some point (answer: no)',
    '1: stars float in space, 2: cover yourself in stars, 3: wait for it to space, 4: fly',
    'This is a serious warning about evil notation. Don\'t use it unless you want to not trust numbers.',
    'If it\'s an eternity how can you reach it in finite time?',
    'Much of this game was based on Antimatter Dimensions, which you should play (though it is a bit slower-paced).',
    () => '本游戏的名称含义为十六进制记数法下的某个大数字(' + format(Decimal.pow(2, Math.pow(2, 16))) + ')，在游戏特定阶段就能看到了。',
    'You can report bugs on the game\'s Github repo or by joining the game\'s Discord server, both linked in Options.'
  ],
  getMessage() {
    let x = Math.floor(Date.now() / Math.pow(2, 14));
    let y = Math.floor([...Array(24)].map(i => Math.pow(x ^ Math.pow(2, i), 1.5)).reduce((a, b) => a + b));
    let r = this.messages[y % this.messages.length];
    return typeof r === 'string' ? r : r();
  }
}