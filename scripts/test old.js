Phaserfroot.PluginManager.register(
  "Test",
  class Test extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "Test",
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
      this.my_name = instanceProperties[ "my name" ];
      this.textfield = ( typeof instanceProperties[ "textfield" ] !== "undefined" ) ? this.scene.getChildById( instanceProperties[ "textfield" ], true ) : null;


      // Boot phase.


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

    }

    // CUSTOM METHODS

    executeMessagegame_in () {
      // Executed when the 'game-in' is received.
      if (this.value[0] == 'player connected') {
        if (this.value.slice(-1)[0] != this.my_name) {
          this.checkScene( "Create Text block did not work, likely because the level changed before it was triggered.\n\nSuggestion: check whether the level has changed before running this section of code." );
          this.textfield = this.scene.addText( { x: 0, y: 0, textText: (this.value.slice(-1)[0]) } );
          if ( !this.textfield ) {
            this.reportError( "`Set Instance X` block could not find the instance [textfield]." );
            return;
          }
          this.textfield.posX = this.math_random_int( 10, 500 );
          if ( !this.textfield ) {
            this.reportError( "`Set Instance Y` block could not find the instance [textfield]." );
            return;
          }
          this.textfield.posY = this.math_random_int( 10, 500 );
        }
      }
    }

    promptUser ( message ) {
      this.scene.physics.pause();
      var val = window.prompt( message );
      this.scene.physics.resume();
      return val;
    }

    onLevelStart2() {
      this.my_name = this.promptUser( 'What is your name?' );
      this.owner.components.getByName( "TextAutomation" )[ 0 ].text = this.my_name;
      this.scene.messageExternal( 'game-out', ['player connected', this.my_name] );

    }

    onMessageReceived ( name, message ) {

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

    math_random_int ( a, b ) {
      if ( a > b ) {
        // Swap a and b to ensure a is smaller.
        var c = a;
        a = b;
        b = c;
      }
      return Math.floor( Math.random() * ( b - a + 1 ) + a );
    }

    reportError( message ) {
      message = "(" + this.name.replace( /_[\d]+$/, "" ) + ")" + message;
      console.trace( message );
      this.game.reportError( message, message, "SCRIPT ERROR" );
    }

  }
);