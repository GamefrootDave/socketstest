Phaserfroot.PluginManager.register(
  "EnemyShip",
  class EnemyShip extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "EnemyShip",
        owner: target,
      } );
      this.instanceProperties = instanceProperties;
      this.scene = target.scene;
      this.game = target.scene.game;

      this.owner.once( "levelSwitch", this.destroy, this );

      // Attach custom event listeners.
      this.owner.on( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );
      this.owner.properties.onUpdate( this.onMessageReceived, this, "_messaging_");


      // Initialize properties from parameters.
      this.value = instanceProperties[ "value" ];
      this.this_player_s_name = instanceProperties[ "this player's name" ];
      this.textfield = ( typeof instanceProperties[ "textfield" ] !== "undefined" ) ? this.scene.getChildById( instanceProperties[ "textfield" ], true ) : null;
      this.ticks_since_update = instanceProperties[ "ticks since update" ];


      // Boot phase.

      this.onCreate();

    }

    // BUILT-IN METHODS

    preUpdate () {

    }

    update () {

    }

    postUpdate () {
      this.EVENTS_POST_UPDATE();

    }

    destroy () {
      this.owner.off( "levelSwitch", this.destroy, this );

      // Detach custom event listeners.
      this.owner.removeListener( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );

    }

    // CUSTOM METHODS

    onCreate () {
      // Executed when this script is initially created.
      this.owner.tags.add( 'enemy ship' );
    }

    executeMessageplayer_name () {
      // Executed when the 'player name' is received.
      this.this_player_s_name = this.value;
      this.owner.properties.set( 'player name',this.this_player_s_name );
      this.checkScene( "Create Text block did not work, likely because the level changed before it was triggered.\n\nSuggestion: check whether the level has changed before running this section of code." );
      this.textfield = this.scene.addText( { x: 0, y: 0, textText: this.value } );
      if ( !this.textfield ) {
        this.reportError( "`Set Text Numeric` block could not find an instance called [textfield]." );
        return;
      }
      if ( !this.textfield.setFontSize ) {
        this.reportError( "`Set Text Numeric` block could not find text properties on an instance called [textfield]." );
        return;
      }
      this.textfield.setFontSize( 18 );
      if ( !this.textfield ) {
        this.reportError( "`Set Text Colour` block could not find an instance called [textfield]." );
        return;
      }
      if ( !this.textfield.setColor ) {
        this.reportError( "`Set Text Colour` block could not find text color information on an instance called [textfield]." );
        return;
      }
      this.textfield.setColor( "0xffffff".replace( /^0x/, "#" ) );
      if ( !this.textfield ) {
        this.reportError( "`Set Text Alignment` block could not find an instance called [textfield]." );
        return;
      }
      if ( !this.textfield.setAlign ) {
        this.reportError( "`Set Text Alignment` block could not find text alignment information on an instance called [textfield]." );
        return;
      }
      this.textfield.setAlign( "center" );
      if ( this.textfield.width === 0 ) {
        this.textfield.width = 1;
        this.textfield.displayOriginX = this.textfield.width * 0.5;
        this.textfield.width = 0;
      } else {
        this.textfield.displayOriginX = this.textfield.width * 0.5;
      }
    }

    EVENTS_POST_UPDATE () {
      // Executed every frame.
      if ( !this.textfield ) {
        this.reportError( "`Set Instance CenterY` block could not find the instance [textfield]." );
        return;
      }
      this.textfield.x = this.owner.x + 0;
      if ( !this.textfield ) {
        this.reportError( "`Set Instance CenterY` block could not find the instance [textfield]." );
        return;
      }
      this.textfield.y = this.owner.y + 60;
      this.ticks_since_update = this.ticks_since_update + 1;
      if (this.ticks_since_update > 1000) {
        this.owner.alpha = 0.5;
      } else {
        this.owner.alpha = 1;
      }
      if (this.ticks_since_update > 10000) {
        this.scene.broadcast( 'remove player from list', this.this_player_s_name );
        if ( !this.textfield ) {
          this.reportError( "`Destroy` block could not find the instance [textfield]." );
          return;
        }
        this.textfield.destroySafe();
        this.owner.destroySafe();
      }
    }

    executeMessagegame_in () {
      // Executed when the 'game-in' is received.
      if (this.value[0] == 'updatePlayer') {
        if (this.value[1] == this.this_player_s_name) {
          this.owner.bearing = this.value[2];
          this.owner.x = this.value[3];
          this.owner.y = this.value[4];
          this.owner.body.velocity.x = (this.value[5]);
          this.owner.body.velocity.y = (this.value[6]);
          this.ticks_since_update = 0;
        }
      }
      if (this.value[0] == 'chat') {
        if (this.value[1] == this.this_player_s_name) {
          if ( !this.textfield ) {
            this.reportError( "`Set Text on Text` block could not find an instance called [textfield]." );
            return;
          }
          this.textfield.components.getByName( "TextAutomation" )[ 0 ].text = ([this.this_player_s_name,': ',this.value[2]].join(''));
        }
      }
    }

    onLevelStart2() {
      this.scene.broadcast( 'enemy ship', this.owner );
      this.owner.destroySafe();

    }

    onMessageReceived ( name, message ) {

      if ( message === 'player name' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessageplayer_name();
      }

      if ( message === 'game-in' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagegame_in();
      }

    }

    checkScene( message ) {
      if ( !this.scene.add ) {
        this.game.reportError( message, message, 'SCRIPT ERROR' );
      }
    }

    reportError( message ) {
      message = "(" + this.name.replace( /_[\d]+$/, "" ) + ")" + message;
      console.trace( message );
      this.game.reportError( message, message, "SCRIPT ERROR" );
    }

  }
);