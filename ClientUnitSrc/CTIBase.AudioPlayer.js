/**
 * @class Terrasoft.controls.AudioPlayer
 * Класс, реализующий аудиоплеер.
 */
Ext.define("Terrasoft.controls.AudioPlayer", {
	extend: "Terrasoft.Component",
	alternateClassName: "Terrasoft.AudioPlayer",

	//region Fields: Private

	/**
	 * Имя аудиоплеера.
	 * @private
	 * @type {String}
	 */
	name: "",

	/**
	 * Содержит функцию обработчик нажатия кнопки мыши на элементе управления.
	 * @private
	 * @deprecated
	 * @type {Function}
	 */
	handler: Terrasoft.emptyFn,

	/**
	 * Идентификатор аудиопотока.
	 * @private
	 * @type {String}
	 */
	sourceId: "",

	/**
	 * Url аудиопотока.
	 * @private
	 * @type {String}
	 */
	sourceUrl: "",

	//endregion

	//region Fields: Protected

	/**
	 * @inheritdoc Terrasoft.Component#tpl
	 * @overridden
	 */
	/* jshint quotmark: false */
	tpl: [
		'<audio id="{id}" preload="none" src="{sourceUrl}" sourceId="{sourceId}"/>'
	],
	/* jshint quotmark: true */

	//endregion

	//region Methods: Private

	/**
	 * Устанавливает идентификатор аудиопотока.
	 * @private
	 * @param {String} sourceId Идентификатор аудиопотока.
	 */
	setSourceId: function(sourceId) {
		if (this.sourceId === sourceId) {
			return;
		}
		this.sourceId = sourceId;
		this.reRender();
	},

	/**
	 * Устанавливает Url аудиопотока.
	 * Данная функция изменяет источник аудиопотока, при этом она не должна инициировать reRender.
	 * @private
	 * @param {String} sourceUrl Url аудиопотока.
	 */
	setSourceUrl: function(sourceUrl) {
		if (this.sourceUrl === sourceUrl) {
			return;
		}
		this.sourceUrl = sourceUrl;
		if (!this.rendered) {
			return;
		}
		var wrapEl = this.getWrapEl();
		if (!wrapEl) {
			return;
		}
		wrapEl.dom.src = sourceUrl;
	},

	//endregion

	//region Methods: Protected

	/**
	 * @inheritdoc Terrasoft.Component#getBindConfig
	 * @overridden
	 */
	getBindConfig: function() {
		var bindConfig = this.callParent(arguments);
		var audioPlayerBindConfig = {
			sourceId: {
				changeMethod: "setSourceId"
			},
			sourceUrl: {
				changeMethod: "setSourceUrl"
			}
		};
		Ext.apply(audioPlayerBindConfig, bindConfig);
		return audioPlayerBindConfig;
	},

	/**
	 * Метод возвращает селекторы элемента управления аудиоплеера.
	 * @protected
	 * @return {Object} Объект селекторов.
	 */
	getSelectors: function() {
		return {
			wrapEl: "#" + this.id,
			el: "#" + this.id
		};
	},

	/**
	 * @inheritdoc Terrasoft.Component#getTplData
	 * @overriden
	 */
	getTplData: function() {
		var tplData = this.callParent(arguments);
		var audioTplData = {
			sourceId: this.sourceId,
			sourceUrl: Terrasoft.utils.common.encodeHtml(this.sourceUrl)
		};
		Ext.apply(audioTplData, tplData);
		this.selectors = this.getSelectors();
		return audioTplData;
	},

	/**
	 * @inheritdoc Terrasoft.Component#initDomEvents
	 * @overriden
	 */
	initDomEvents: function() {
		this.callParent(arguments);
		var wrapEl = this.getWrapEl();
		if (!wrapEl) {
			return;
		}
		wrapEl.on({
			ended: {
				fn: this.onPlaybackEnded,
				scope: this
			},
			error: {
				fn: this.onError,
				scope: this
			}
		});
	},

	/**
	 * @inheritdoc Terrasoft.Component#clearDomListeners
	 * @overriden
	 */
	clearDomListeners: function() {
		this.callParent(arguments);
		var wrapEl = this.getWrapEl();
		if (!wrapEl) {
			return;
		}
		wrapEl.removeAllListeners();
	},

	/**
	 * Обрабатывает событие окончания воспроизведения.
	 * @protected
	 */
	onPlaybackEnded: function() {
		this.fireEvent("playbackended");
	},

	/**
	 * Обрабатывает событие ошибки.
	 * @protected
	 * @param {Object} errorObject Объект с информацией о ошибке.
	 */
	onError: function(errorObject) {
		var errorCode = errorObject.target.error.code;
		if ((errorCode === errorObject.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED) &&
				Ext.isEmpty(errorObject.target.currentSrc)) {
			return;
		}
		this.fireEvent("error", errorCode);
	},

	/**
	 * @inheritDoc Terrasoft.Component#init
	 * @protected
	 */
	init: function() {
		this.callParent(arguments);
		this.addEvents(
			/**
			 * @event
			 * Воспроизведение завершено.
			 */
			"playbackended",
			/**
			 * @event
			 * Ошибка.
			 */
			"error"
		);
	},

	//endregion

	//region Methods: Public

	/**
	 * Запускает проигрывание аудиопотока.
	 */
	play: function() {
		var wrapEl = this.getWrapEl();
		if (!wrapEl) {
			return;
		}
		wrapEl.dom.play();
	},

	/**
	 * Останавливает воспроизведение аудиопотока.
	 */
	stop: function() {
		var wrapEl = this.getWrapEl();
		if (!wrapEl) {
			return;
		}
		var elDom = wrapEl.dom;
		elDom.pause();
		elDom.currentTime = 0;
	}

	//endregion

});
