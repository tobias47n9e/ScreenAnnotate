const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const Clutter = imports.gi.Clutter;
const Mainloop = imports.mainloop;
const Cairo = imports.cairo;

const debug = true;

let annotate;

/**
* Function prints messages only if debug is on (true).
*/
function print_message(msg) {
    if (debug == true) {
        global.log("[ScrAn] " + msg)
    }
}

/**
* Main shell extension object.
*/
const ScreenAnnotate = new Lang.Class({
    Name: 'ScreenAnnotate',
    Extends: PanelMenu.Button,

    /**
    * Initializes the shell extension object.
    */
    _init: function() {
        this.parent(0.0, "ScreenAnnotate");
        this.offset = [1000, 500];
        this.cnvs_size = [200, 200];

        this.label = new St.Label({
            text: "Choose Pen",
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        });

        this.actor.add_actor(this.label);

        this.cnvs_actor = new Clutter.Actor();

        this.setup_cnvs_actor();
    },

    /**
    * Sets the size, background and offset of canvas actor. Shows it and
    * adds it to the main uiGroup. Connects the signals of the actor.
    */
    setup_cnvs_actor: function () {
        let color = new Clutter.Color({
            red: 255,
            green: 0,
            blue: 0,
            alpha: 128
        });

        this.cnvs_actor.set_position(this.offset[0], this.offset[1]);
        this.cnvs_actor.set_width(this.cnvs_size[0]);
        this.cnvs_actor.set_height(this.cnvs_size[1]);
        this.cnvs_actor.set_background_color(color);
        this.cnvs_actor.show_all();
        this.cnvs_actor.set_reactive(true);
        this.cnvs_actor.connect("button-press-event", this.button_pressed.bind(this));
        this.cnvs_actor.connect("button-release-event", this.button_released);
        Main.uiGroup.add_actor(this.cnvs_actor);
    },

    /**
    * Draws a point at certain coordinates and offset. Called by
    * click events on the canvas.
    */
    draw_point: function(canvas, cr, width, height, coords, offset) {
        let x = coords[0] - offset[0];
        let y = coords[1] - offset[1];

        cr.save();
        cr.setOperator(Cairo.Operator.CLEAR);
        cr.paint();
        cr.restore();
        cr.setOperator(Cairo.Operator.OVER);
        cr.setLineCap(Cairo.LineCap.ROUND);
        cr.setLineWidth(5);

        cr.translate(x, y);
        cr.arc(0, 0, 10, 0, Math.PI * 2);
        cr.stroke();

        return true;
    },

    /**
    * Clicking on the canvas calls this function. Sends a
    * ClutterActor and a ClutterEvent.
    *
    * event.get_button(): mouse buttons 1,2,3
    */
    button_pressed: function (actor, event) {
        let btn = event.get_button();
        let coords = event.get_coords();
        let self = this;

        print_message(
            "Click Event: Button: " + btn + " " + Math.round(coords[0]) +
            "x " + Math.round(coords[1]) + "y "
        );

        let canvas = new Clutter.Canvas();
        canvas.set_size(this.cnvs_size[0],this.cnvs_size[1]);

        canvas.connect("draw", function(canvas, cr, width, height) {
            self.draw_point(canvas, cr, width, height, coords, self.offset);
        });

        canvas.invalidate();

        this.cnvs_actor.set_content(canvas);

        return true
    },

    /**
    * Releasing the mouse button calls this function. Sends a
    * ClutterActor and a ClutterEvent.
    *
    * event.get_button(): mouse buttons 1,2,3
    */
    button_released: function (actor, event) {
        let btn = event.get_button();
        let coords = event.get_coords();
        let self = this;

        print_message(
            "Release Event: Button: " + btn + " " + Math.round(coords[0]) +
            "x " + Math.round(coords[1]) + "y "
        );

        return true
    },

    destroy: function() {
        this.parent();
        this.cnvs_actor.destroy();
    },
});

/**
* Initializes the shell extension.
*/
function init() {

}

/**
* Runs when the shell extension is enabled.
*/
function enable() {
    annotate = new ScreenAnnotate();

    Main.panel.addToStatusArea('screen-annotate', annotate, 1, 'right');
}

/**
* Runs when the shell extension is disabled.
*/
function disable() {
    annotate.destroy();
}
