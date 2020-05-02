Phaserfroot.PluginManager.register(
  "Ship",
  class Ship extends Phaserfroot.Component {
    constructor( target, instanceProperties ) {
      super( {
        name: "Ship",
        owner: target,
      } );
      this.instanceProperties = instanceProperties;
      this.scene = target.scene;
      this.game = target.scene.game;

      this.owner.once( "levelSwitch", this.destroy, this );

      // Attach custom event listeners.
      this.owner.properties.onUpdate( this.onMessageReceived, this, "_messaging_");
      this.scene.getKey( 32 ).on( "down", this.onKeyInput32, this );


      // Initialize properties from parameters.
      this.value = instanceProperties[ "value" ];
      this.bullet = instanceProperties[ "bullet" ];
      this.my_name = instanceProperties[ "my name" ];
      this.thrust = instanceProperties[ "thrust" ];


      // Boot phase.

      this.onCreate();

    }

    // BUILT-IN METHODS

    preUpdate () {

    }

    update () {
      this.EVENTS_UPDATE();

    }

    postUpdate () {

    }

    destroy () {
      this.owner.off( "levelSwitch", this.destroy, this );

      // Detach custom event listeners.
      this.scene.getKey( 32 ).off( "down", this.onKeyInput32, this );

    }

    // CUSTOM METHODS

    onCreate () {
      // Executed when this script is initially created.
      this.owner.tags.add( 'ship' );
    }

    executeMessagebullet () {
      // Executed when the 'bullet' is received.
      this.bullet = (this.errorCheckNotNull( this.value, this.owner, "`Get Class Of Instance` block could not find an instance named [value].")).name;
    }

    executeMessagename () {
      // Executed when the 'name' is received.
      this.my_name = this.value;
      this.owner.x = this.math_random_int( 5, 950 );
      this.owner.y = this.math_random_int( 5, 450 );
    }

    EVENTS_UPDATE () {
      // Executed every frame.
      if (( this.scene.getKey( 87 ).isDown || this.scene._keys.lastPressed === 87 )) {
        this.thrust = Math.min(Math.max(this.thrust + 10, 0), 300);
      } else {
        this.thrust = Math.min(Math.max(this.thrust - 10, 0), 300);
      }
      if (( this.scene.getKey( 65 ).isDown || this.scene._keys.lastPressed === 65 ) && ( this.scene.getKey( 68 ).isDown || this.scene._keys.lastPressed === 68 )) {
        this.owner.bearing = this.owner.bearing;
      } else if (( this.scene.getKey( 65 ).isDown || this.scene._keys.lastPressed === 65 )) {
        this.owner.bearing = this.owner.bearing - 2;
      } else if (( this.scene.getKey( 68 ).isDown || this.scene._keys.lastPressed === 68 )) {
        this.owner.bearing = this.owner.bearing + 2;
      }
      this.owner.body.velocity.x = (Math.cos((this.owner.bearing - 90) / 180 * Math.PI) * this.thrust);
      this.owner.body.velocity.y = (Math.sin((this.owner.bearing - 90) / 180 * Math.PI) * this.thrust);
      if (this.owner.x > 960) {
        this.owner.x = 1;
      } else if (this.owner.x < 0) {
        this.owner.x = 959;
      } else if (this.owner.y > 540) {
        this.owner.y = 1;
      } else if (this.owner.y < 0) {
        this.owner.y = 539;
      }
      this.scene.messageExternal( 'game-out', ['updatePlayer', this.my_name, this.owner.bearing, this.owner.x, this.owner.y, this.owner.body.velocity.x, this.owner.body.velocity.y] );
    }

    onKeyInput32 () {
      this.create_and_shoot_bullet( this.owner.bearing, this.owner.x, this.owner.y );
      this.scene.messageExternal( 'game-out', ['shootBullet', this.my_name, this.owner.bearing, this.owner.x, this.owner.y] );
    }

    executeMessagegame_in () {
      // Executed when the 'game-in' is received.
      if (this.value[0] == 'shootBullet') {
        if (this.value[1] != this.my_name) {
          this.create_and_shoot_bullet( this.value[2], this.value[3], this.value[4] );
        }
      }
    }

    onMessageReceived ( name, message ) {

      if ( message === 'bullet' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagebullet();
      }

      if ( message === 'name' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagename();
      }

      if ( message === 'game-in' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagegame_in();
      }

    }

    reportError( message ) {
      message = "(" + this.name.replace( /_[\d]+$/, "" ) + ")" + message;
      console.trace( message );
      this.game.reportError( message, message, "SCRIPT ERROR" );
    }

    errorCheckNotNull( input, backup, message ) {
      if( !input ) {
        reportError( message );
        return backup;
      }
      return input;
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

    create_and_shoot_bullet ( rotation, x_pos, y_pos ) {
      var instance = this.scene.addSpriteByName( this.bullet );
      if ( !instance ) {
        this.reportError( "`Set Instance Rotation` block could not find the instance [instance]." );
        return;
      }
      instance.bearing = rotation;
      if ( !instance ) {
        this.reportError( "`Set Instance CenterY` block could not find the instance [instance]." );
        return;
      }
      instance.x = x_pos;
      if ( !instance ) {
        this.reportError( "`Set Instance CenterY` block could not find the instance [instance]." );
        return;
      }
      instance.y = y_pos;
      this.scene.messageInstance( instance, 'shoot' );
    }

  }
);