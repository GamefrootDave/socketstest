Phaserfroot.PluginManager.register(
  "Bullet",
  class Bullet extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "Bullet",
        owner: target,
      } );
      this.instanceProperties = instanceProperties;
      this.scene = target.scene;
      this.game = target.scene.game;

      this.owner.once( "levelSwitch", this.destroy, this );

      // Attach custom event listeners.
      this.owner.on( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );
      this.owner.properties.onUpdate( this.onMessageReceived, this, "_messaging_");
      this.owner.on( this.owner.EVENTS.COLLIDE, this.onTouchInstance2, this );


      // Initialize properties from parameters.
      this.toucher = ( typeof instanceProperties[ "toucher" ] !== "undefined" ) ? this.scene.getChildById( instanceProperties[ "toucher" ], true ) : null;


      // Boot phase.

      this.onCreate();

    }

    // BUILT-IN METHODS

    preUpdate () {

    }

    update () {

    }

    postUpdate () {

    }

    destroy () {
      this.owner.off( "levelSwitch", this.destroy, this );

      // Detach custom event listeners.
      this.owner.removeListener( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );
      if ( this.delayed_event ) this.delayed_event.remove();
      if ( this.delayed_event2 ) this.delayed_event2.remove();
      this.owner.off( this.owner.EVENTS.COLLIDE, this.onTouchInstance2, this );

    }

    // CUSTOM METHODS

    onCreate () {
      // Executed when this script is initially created.
      this.owner.tags.add( 'bullet' );
    }

    executeMessageshoot () {
      // Executed when the message 'shoot' is received.

      // Set side collisions.
      this.owner.body.checkCollision.left = false;
      this.owner.body.checkCollision.right = false;
      this.owner.body.checkCollision.up = false;
      this.owner.body.checkCollision.down = false;
      this.owner.body.checkCollision.none = !(
        this.owner.body.checkCollision.left ||
        this.owner.body.checkCollision.right ||
        this.owner.body.checkCollision.up ||
        this.owner.body.checkCollision.down );
      // Get the current layer.
      var layer = this.scene.physicsLayersManager.getLayersWithChild( this.owner )[ 0 ];
      layer = layer ? this.scene.physicsLayersManager.layers.indexOf( layer ) : 0;
      if ( this.owner.body.checkCollision.none ) {
        // Remove from current layer.
        this.scene.physicsLayersManager.layers[ layer ].remove( this.owner );
      } else if ( !this.scene.physicsLayersManager.layers[ layer ].hasChild( this.owner ) ) {
      // Add back to a layer - probably default, 0.
        this.scene.physicsLayersManager.layers[ layer ].add( this.owner );
      }

      this.owner.body.velocity.x = (Math.cos((this.owner.bearing - 90) / 180 * Math.PI) * 800);
      this.owner.body.velocity.y = (Math.sin((this.owner.bearing - 90) / 180 * Math.PI) * 800);
      this.delayed_event = this.scene.time.delayedCall( 50, function() {
        if ( !this.owner || this.owner.exists === false ) {
          return;
        }

        // Set side collisions.
        this.owner.body.checkCollision.left = true;
        this.owner.body.checkCollision.right = true;
        this.owner.body.checkCollision.up = true;
        this.owner.body.checkCollision.down = true;
        this.owner.body.checkCollision.none = !(
          this.owner.body.checkCollision.left ||
          this.owner.body.checkCollision.right ||
          this.owner.body.checkCollision.up ||
          this.owner.body.checkCollision.down );
        // Get the current layer.
        var layer = this.scene.physicsLayersManager.getLayersWithChild( this.owner )[ 0 ];
        layer = layer ? this.scene.physicsLayersManager.layers.indexOf( layer ) : 0;
        if ( this.owner.body.checkCollision.none ) {
          // Remove from current layer.
          this.scene.physicsLayersManager.layers[ layer ].remove( this.owner );
        } else if ( !this.scene.physicsLayersManager.layers[ layer ].hasChild( this.owner ) ) {
        // Add back to a layer - probably default, 0.
          this.scene.physicsLayersManager.layers[ layer ].add( this.owner );
        }

      }, null, this );
      this.delayed_event2 = this.scene.time.delayedCall( 5000, function() {
        if ( !this.owner || this.owner.exists === false ) {
          return;
        }
          this.owner.destroySafe();
      }, null, this );
    }

    onLevelStart2() {
      this.scene.broadcast( 'bullet', this.owner );
      this.owner.destroySafe();

    }

    onMessageReceived ( name, message ) {

      if ( message === 'shoot' ) {
        this.executeMessageshoot();
      }

    }

    onTouchInstance2 ( instance ) {
      if ( !instance ) {
        return;
      }
      if ( instance instanceof Phaser.Tilemaps.Tile ) {
        instance = instance.layer.tilemapLayer;
      }
      this.toucher = instance;
        this.owner.destroySafe();

    }

  }
);