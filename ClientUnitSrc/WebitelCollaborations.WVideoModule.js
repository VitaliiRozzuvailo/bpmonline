define("WVideoModule", ["ext-base", "terrasoft", "WVideoModuleResources", "css!WVideoModule"],
	function(Ext, Terrasoft, resources) {
		/**
		 *
		 * @param renderTo
		 * @param useVideo
		 * @returns {createVideoContainer}
		 */
		function createVideoContainer(renderTo, useVideo) {
			if (Ext.getCmp("VideoConteiner")) {
				return;
			}
			this.Container = Ext.create("Ext.Component", {
				className: "Terrasoft.Container",
				id: "VideoContainer",
				draggable: true,
				resizable: {
					target: "croix-de-fer",
					dynamic: true,
					pinned: true,
					minHeight: 280,
					minWidth: 240,
					preserveRatio: true,
					heightIncrement: 5,
					widthIncrement: 5
				},
				viewVisible: true,
				style: {
					display: "block",
					position: "fixed",
					bottom: 0,
					right: 0,
					width: useVideo ? "400px" : "100px",
					height: useVideo ? "300px" : "100px"
				},
				renderTo:  renderTo,
				items: [
					{
						autoEl: "div",
						id: "Buttons",
						viewVisible: true
					}
				],
				listeners: {
					dblclick : function() {
						var video = document.getElementById("IncomingVideo");
						if (video.requestFullscreen) {
							video.requestFullscreen();
						} else if (video.mozRequestFullScreen) {
							video.mozRequestFullScreen(); // Firefox
						} else if (video.webkitRequestFullscreen) {
							video.webkitRequestFullscreen(); // Chrome and Safari
						}
					},
					element: "el"
				}
			});

			Ext.create("Ext.Component", {
				autoEl: "div",
				id: "IncomingVideo-container",
				viewVisible: true,
				style: {
					"float": "right",
					width: "100%",
					height: "100%",
					"background": "black"
				},
				renderTo:  Ext.get("VideoContainer")
			});

			this.addIncVideo = function(id) {
				if (!Ext.get("IncomingVideo-" + id)) {
					Ext.create("Ext.Component", {
						"autoEl": "video",
						"id": "IncomingVideo-" + id,
						"viewVisible": true,
						"style": {
							"float": "right",
							"width": "100%",
							"height": "100%",
							"background": "black"
						},
						"renderTo": Ext.get("IncomingVideo-container")
					});
				}
				return "IncomingVideo-" + id;
			};

			Ext.create("Ext.Component", {
				"autoEl": "video",
				"id": "OutgoingVideo",
				"viewVisible": true,
				"style": {
					"float": "right",
					"width": useVideo ? "100px" : "100px",
					"height": useVideo ? "70px" : "100px",
					"background": "black",
					"position": "absolute",
					"bottom": "0px",
					"right": "8px",
					"margin-bottom": "9px"
				},
				renderTo: Ext.get("VideoContainer")
			});
			if (useVideo) {
				Ext.create("Ext.Component", {
					id: "videoBtn",
					className: "Terrasoft.Container",
					selectors: {
						wrapEl: "#videoBtn"
					},
					renderTo: Ext.get("leftPanel"),
					style: {
						display: "block",
						position: "fixed",
						bottom: "5px",
						left: "5px",
						width: "30px",
						height: "17px"
					},
					listeners: {
						click: function() {
							Ext.global.webitel.video.setVisible(!Ext.global.webitel.video.getVisible());
						},
						element: "el"
					}
				});
				var ControlImage = Ext.get("videoBtn").dom;
				var imageUrl = Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.imgVideoVisible);
				ControlImage.style.setProperty("background", "url(" + imageUrl + ") 50% 50% no-repeat");
			}

			this.setVisible = function(Visible) {
				this.Container.setVisible(Visible);
			};

			this.getVisible = function() {
				return this.Container.isVisible();
			};

			return this;
		}

		return {
			createVideoContainer: createVideoContainer
		};
	});
