let PrestigeLayerNames = {
  layers: ['转生', '无限', '永恒', '繁复', '终焉'],
  highestLayer() {
    if (player.finalities > 0) {
      return '终焉';
    } else if (player.complexities > 0) {
      return '繁复';
    } else if (player.eternities.gt(0)) {
      return '永恒';
    } else if (player.infinities > 0) {
      return '无限';
    } else {
      return '转生';
    }
  },
  layersAboveDisplay(x) {
    let hl = this.highestLayer();
    if (Options.showAllTabs()) {
      hl = '终焉';
    }
    let layers = this.layers.slice(this.layers.indexOf(x), this.layers.indexOf(hl) + 1);
    return coordinate('*', '', layers);
  }
}
