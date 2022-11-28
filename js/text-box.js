let TextBoxes = {
  data: {
    'boost-power': {
      'condition': () => player.boostPower > 1,
      'text': () => ('您开始产生推力了！推力的产量基于超过' +
      formatInt(Boost.boostPowerStart()) + '的推进数量。推力在永恒重置时重置，但在无限重置时保留。推力可以基于数量提供' +
      '每推力的倍率，且可以提供定理(永恒重置时保留)。' +
      '您可以在主要面板下查看推力的情况。')
    },
    'ec-4-exit': {
      'condition': () => false,
      'text': (completions) => ('您的无限次数太多，无法继续进行永恒挑战' +
      formatOrdinalInt(4) + '，因此您退出了该挑战' + ((completions > 0) ?
      (EternityChallenge.canCompleteMultipleTiersAtOnce() ?
      '(并完成了' + completions + '阶层的永恒挑战' + formatOrdinalInt(4) + '' + pluralize(completions, '', '') + ')。' :
      '(并完成了它)。') : '(但并没有完成它)。'))
    }
  },
  create(rawText, data) {
    // It's rare enough for two text boxes to be created at once that we can just remove the existing one.
    // It's probably best not to have two at once?
    for (let i of document.getElementsByClassName('box')) {
      if (i.parentElement === document.body) {
        document.body.removeChild(i);
      }
    }
    let text = typeof rawText === 'function' ? rawText(data) : rawText;
    let box = document.createElement('div');
    box.className = 'box';
    let textSpan = document.createElement('span');
    textSpan.className = 'box-text';
    textSpan.innerText = text;
    box.appendChild(textSpan);
    box.appendChild(document.createElement('br'));
    let close = document.createElement('button');
    close.onclick = function () {
      document.body.removeChild(box);
    }
    close.innerText = 'Close this';
    box.appendChild(close);
    document.body.appendChild(box);
  },
  checkDisplay() {
    for (let i in this.data) {
      if (!player.hasSeenTextBox[i] && this.data[i].condition()) {
        this.display(i);
      }
    }
  },
  display(i, data) {
    // Note that this will always redisplay the text box whether or not it's been shown.
    // Data can be undefined.
    player.hasSeenTextBox[i] = true;
    this.create(this.data[i].text, data);
  }
}
