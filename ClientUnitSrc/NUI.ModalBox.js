define("ModalBox", ["ext-base", "css!ModalBox"], function(Ext) {
	/**
	 * Максимальный размер модуля в процентах.
	 * @private
	 * @type {Number}
	 */
	var fullSize = 100;

	/**
	 * Размер модуля по умолчанию.
	 * @private
	 * @type {Number}
	 */
	var defaultSize = 50;

	/**
	 * id модуля.
	 * @private
	 * @type {String}
	 */
	var id = "";

	/**
	 * Ссылка на элемент div верхнего уровня.
	 * @private
	 * @type {Ext.Element}
	 */
	var modalBoxEl = null;

	/**
	 * Ссылка на элемент модальности.
	 * @private
	 * @type {Ext.Element}
	 */
	var coverEl = null;

	/**
	 * Ссылка на внутрений div элемент.
	 * @private
	 * @type {Ext.Element}
	 */
	var innerBoxEl = null;

	/**
	 * Ссылка на внутрений div элемент с фиксированым положением.
	 * @private
	 * @type {Ext.Element}
	 */
	var fixedBoxEl = null;

	/**
	 * Объект содержащий минимальные и максимальные размеры модуля в пикселях.
	 * @private
	 * @type {Number}
	 */
	var boxSize = null;

	/**
	 * Объект селекторов
	 * @private
	 * @type {Object}
	 */
	var selectors = null;

	/**
	 * Признак наличия вертикальной полосы прокрутки.
	 */
	var disableScroll = false;
	
	var openedModalBoxCssClass = "ts-modalbox-opened";

	/**
	 * Список названий css классов используемых в модуле.
	 * @private
	 * @type {Object}
	 */
	var configCssClasses = {
		modalBox: "ts-modalbox",
		cover: "ts-modalbox-cover",
		centerPosition: "ts-modalbox-center-position",
		innerBox: "ts-modalbox-innerbox",
		fixedBox: "ts-modalbox-fixedbox"
	};

	/*jshint white:false */
	/**
	 * Шаблон разметки модуля.
	 * @private
	 * @type {Array}
	 */
	var boxTemplate = [
		"<div id=\"{id}-cover\" class=\"{coverClass}\"></div>",
		"<div id=\"{id}-box\" class=\"{boxClasses}\" style=\"{boxStyles}\">",
		"<div id=\"{id}-fixedBox\" class=\"{fixedBoxClasses}\"></div>",
		"<div id=\"{id}-innerBox\" class=\"{innerBoxClasses}\"></div>",
		"</div>"
	];
	/*jshint white:true */

	/**
	 * Экземпляр класса Ext.KeyMap для обработки нажатия кнопки esc.
	 * @private
	 * @type {Ext.KeyMap}
	 */
	var keyMap = null;

	/**
	 * Callback-функция вызываемая при закрытии окна.
	 * @private
	 * @type {Function|null}
	 */
	var onClosed = null;

	/**
	 * Иницализирует начальные значения модуля.
	 * @private
	 * @param {Object} cfg Параметры модуля.
	 * @param {Function} onCloseCallback Callback-функция которая будет вызвана при закрытии окна.
	 * @param {Object} scope Контекст выполнения onCloseCallback.
	 */
	function init(cfg, onCloseCallback, scope) {
		id = Ext.id();
		cfg = cfg || {};
		selectors = {
			modalBoxEl: id + "-box",
			coverEl: id + "-cover",
			innerBoxEl: id + "-innerBox",
			fixedBoxEl: id + "-fixedBox"
		};
		if (cfg.widthPixels && cfg.heightPixels) {
			boxSize = {
				minWidth: cfg.widthPixels,
				minHeight: cfg.heightPixels,
				maxHeight: cfg.heightPixels,
				maxWidth: cfg.widthPixels
			};
		} else {
			boxSize = calculatePixelSizes(cfg);
		}
		disableScroll = cfg.disableScroll || false;
		if (onCloseCallback) {
			onClosed = onCloseCallback.bind(scope);
		}
	}

	/**
	 * Вычисляет Ext элементы по селекторам.
	 * @private
	 */
	function applySelectors() {
		modalBoxEl = Ext.get(selectors.modalBoxEl);
		if (!modalBoxEl) {
			throw new Terrasoft.ItemNotFoundException();
		}
		coverEl = Ext.get(selectors.coverEl);
		if (!coverEl) {
			throw new Terrasoft.ItemNotFoundException();
		}
		innerBoxEl = Ext.get(selectors.innerBoxEl);
		if (!innerBoxEl) {
			throw new Terrasoft.ItemNotFoundException();
		}
		fixedBoxEl = Ext.get(selectors.fixedBoxEl);
		if (!fixedBoxEl) {
			throw  new Terrasoft.ItemNotFoundException();
		}
		modalBoxEl.on("click", function(event) {
			event.stopEvent();
		});
		coverEl.on("wheel", function(event) {
			event.preventDefault();
		});
		coverEl.on("click", function(event) {
			event.stopEvent();
		});
		fixedBoxEl.on("wheel", function(event) {
			event.preventDefault();
		});
		if (Ext.isIE9 || Ext.isChrome || Ext.isSafari || Ext.isOpera) {
			coverEl.on("mousewheel", function(event) {
				event.preventDefault();
			});
			fixedBoxEl.on("mousewheel", function(event) {
				event.preventDefault();
			});
		} else if (Ext.isGecko) {
			coverEl.on("DOMMouseScroll", function(event) {
				event.preventDefault();
			});
			fixedBoxEl.on("DOMMouseScroll", function(event) {
				event.preventDefault();
			});
		} else {
			coverEl.on("onmousewheel", function(event) {
				event.preventDefault();
			});
			fixedBoxEl.on("onmousewheel", function(event) {
				event.preventDefault();
			});
		}
	}

	function getFixedBoxClasses() {
		var fixedBoxClasses = [];
		fixedBoxClasses.push(configCssClasses.fixedBox);
		return fixedBoxClasses.join(" ");
	}

	/**
	 * Генерирует разметку модуля.
	 * @private
	 * @param {Object} config Конфигурация модального окна.
	 * @return {Ext.XTemplate}
	 */
	function prepareModalBoxHtml(config) {
		var template = new Ext.XTemplate(boxTemplate.join(""));
		return template.apply({
			coverClass: getCoverClasses(),
			boxClasses: getBoxClasses(config),
			boxStyles: getBoxStyles(),
			innerBoxClasses: configCssClasses.innerBox,
			id: id,
			fixedBoxClasses: getFixedBoxClasses()
		});
	}

	/**
	 * Возвращает строку со списком css-классов для элеманта модульности.
	 * @private
	 * @return {String}
	 */
	function getCoverClasses() {
		var coverClasses = [];
		coverClasses.push(configCssClasses.cover);
		return coverClasses.join(" ");
	}

	/**
	 * Возвращает строку со списком css-классов для элемент div верхнего уровня.
	 * @private
	 * @param {Object} config Конфигурация модального окна.
	 * @return {String}
	 */
	function getBoxClasses(config) {
		var boxClasses = [];
		boxClasses.push(configCssClasses.modalBox);
		boxClasses.push(configCssClasses.centerPosition);
		boxClasses = boxClasses.concat(config.boxClasses);
		return boxClasses.join(" ");
	}

	/**
	 * Возвращает строку со списком inline-стилей для элемент div верхнего уровня.
	 * @private
	 * @return {String}
	 */
	function getBoxStyles() {
		var styles = {
			minWidth: boxSize.minWidth + "px",
			minHeight: boxSize.minHeight + "px",
			maxHeight: boxSize.maxHeight + "px",
			maxWidth: boxSize.maxWidth + "px",
			width: boxSize.minWidth + "px",
			height: boxSize.minHeight + "px"
		};
		return Ext.DomHelper.generateStyles(styles);
	}

	/**
	 * Пересчитывает относительные размеры заданые в процентах в пиксели экрана.
	 * @private
	 * @param {Object} boxSizePercents объект содержащий минимальные и максимальные размеры в процентах.
	 * @return {Object} объект содержащий минимальные и максимальные размеры в пикселях.
	 */
	function calculatePixelSizes(boxSizePercents) {
		var boxSizePixels = {};
		var minHeight = boxSizePercents.minHeight;
		var maxHeight = boxSizePercents.maxHeight;
		var minWidth = boxSizePercents.minWidth;
		var maxWidth = boxSizePercents.maxWidth;
		var viewportHeight = Ext.Element.getViewportHeight() / fullSize;
		var viewportWidth = Ext.Element.getViewportWidth() / fullSize;
		boxSizePixels.minHeight = (minHeight > 0) ? viewportHeight * minHeight : viewportHeight * defaultSize;
		boxSizePixels.minWidth = (minWidth > 0) ? viewportWidth * minWidth : viewportWidth * defaultSize;
		boxSizePixels.maxHeight = (maxHeight > 0) ? viewportHeight * maxHeight : viewportWidth * fullSize;
		boxSizePixels.maxWidth = (maxWidth > 0) ? viewportWidth * maxWidth : viewportWidth * fullSize;
		return boxSizePixels;
	}

	/**
	 * Обработчик события нажатия кнопки ESC.
	 * @private
	 */
	function onEscKeyPressed() {
		close(true);
	}

	/**
	 * Показывает модуль, возвращает ссылку на элемент куда будет отображатся модержанее пользовательского контента.
	 * @param {Object} [config] Объект содержащий установленные размеры в пикселях или
	 * минимальные и максимальные размеры в процентах от размера экрана.
	 * @param {Number} [config.minWidth] Минимальная ширина в процентах.
	 * @param {Number} [config.maxHeight] Максимальная высота в процентах.
	 * @param {Number} [config.maxWidth] Максимальная ширина в процентах.
	 * @param {Number} [config.minHeight] Минимальная высота в процентах.
	 * @param {Number} [config.widthPixels] Фиксированная ширина в пикселях.
	 * @param {Number} [config.heightPixels] Фиксированная высота в пикселях.
	 * @param {Array} [config.boxClasses] Css-классы внешнего контейнера.
	 * @param {Function} onCloseCallback Callback-функция которая будет вызвана при закрытии окна.
	 * @param {Object} scope Контекст выполнения onCloseCallback.
	 * @return {Ext.Element} Контейнер для содержимого.
	 */
	function show(config, onCloseCallback, scope) {
		if (modalBoxEl || coverEl) {
			return;
		}
		var body = document.body;
		if (!body) {
			return;
		}
		var bodyEl = Ext.getBody();
		bodyEl.addCls(openedModalBoxCssClass);
		keyMap =  new Ext.util.KeyMap(Ext.getBody(), [{
			key: Ext.EventObject.ESC,
			scope: this,
			fn: onEscKeyPressed
		}]);
		init(config, onCloseCallback, scope);
		var modalBoxHtml = prepareModalBoxHtml(config);
		Ext.DomHelper.insertHtml("beforeEnd", body, modalBoxHtml);
		applySelectors();
		return innerBoxEl;
	}

	/**
	 * Обновляет размеры окна. Если размеры контета превишают заданый максимальный размер -
	 * появляется вертикальная прокрутка.
	 */
	function updateSizeByContent() {
		if (!modalBoxEl) {
			return;
		}
		var modalBoxWidthOffset = modalBoxEl.getPadding("lr") + modalBoxEl.getBorderWidth("lr");
		var modalBoxHeightOffset = modalBoxEl.getPadding("tb") + modalBoxEl.getBorderWidth("tb");
		var width = innerBoxEl.getComputedWidth() + modalBoxWidthOffset;
		// значение округляется - может приводить к появлению полосы прокрутки
		var height = innerBoxEl.getComputedHeight() + modalBoxHeightOffset + 1;
		var maxHeight = boxSize.maxHeight;
		// BrowserSupport: IE8 явная установка высоты т.к. при height > maxHeight окно частично
		// смещается вверх за пределы экрана
		if (Ext.isIE8 && height > maxHeight) {
			height = maxHeight;
		}
		if (disableScroll) {
			modalBoxEl.applyStyles("overflow-y: hidden");
		}
		modalBoxEl.setSize(width, height);
	}

	/**
	 * Устанавливает размеры модального окна в пикселях.
	 */
	function setSize(width, height) {
		if (modalBoxEl) {
			modalBoxEl.setSize(width, height);
		}
	}

	/**
	 * Закрывает окно, уничтожает DOM модуля, удаляет ссылкы на элементы.
	 * @param {Boolean} needDestroyNestedModule Флаг выгрузки загруженого в модальное окно модуля.
	 * Передается как параметр в callback-функцию onClosed.
	 */
	function close(needDestroyNestedModule) {
		if (onClosed) {
			onClosed(needDestroyNestedModule);
		}
		var bodyEl = Ext.getBody();
		if (bodyEl) {
			bodyEl.removeCls(openedModalBoxCssClass);
		}
		keyMap.destroy();
		modalBoxEl.destroy();
		coverEl.destroy();
		innerBoxEl.destroy();
		id = "";
		modalBoxEl = null;
		innerBoxEl = null;
		coverEl = null;
		boxSize = null;
		selectors = null;
		disableScroll = false;
		fixedBoxEl = null;
	}

	function getFixedBox() {
		return fixedBoxEl;
	}

	return {
		getFixedBox: getFixedBox,
		show: show,
		setSize: setSize,
		updateSizeByContent: updateSizeByContent,
		close: close
	};

});