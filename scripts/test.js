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
      this.owner.properties.onUpdate( this.onMessageReceived, this, "_messaging_");
      this.owner.on( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );
      this.scene.getKey( 13 ).on( "down", this.onKeyInput13, this );


      // Initialize properties from parameters.
      this.receivedPlayerList = instanceProperties[ "receivedPlayerList" ];
      this.enemy_ship = instanceProperties[ "enemy ship" ];
      this.ship = ( typeof instanceProperties[ "ship" ] !== "undefined" ) ? this.scene.getChildById( instanceProperties[ "ship" ], true ) : null;
      this.my_random_id = instanceProperties[ "my random id" ];
      this.list = instanceProperties[ "list" ];
      this.players = instanceProperties[ "players" ];
      this.temp_list = instanceProperties[ "temp list" ];
      this.latest_chat = instanceProperties[ "latest chat" ];
      this.my_name = instanceProperties[ "my name" ];
      this.other_player_name = instanceProperties[ "other player name" ];
      this.existing_player_name = instanceProperties[ "existing player name" ];
      this.value = instanceProperties[ "value" ];
      this.i = instanceProperties[ "i" ];


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
      if ( this.delayed_event ) this.delayed_event.remove();
      this.owner.removeListener( this.owner.EVENTS.LEVEL_START, this.onLevelStart2, this );
      this.scene.getKey( 13 ).off( "down", this.onKeyInput13, this );

    }

    // CUSTOM METHODS

    onCreate () {
      // Executed when this script is initially created.
      this.owner.components.getByName( "TextAutomation" )[ 0 ].text = 'Connecting...';
      if ( !this.owner.setAlign ) {
        this.reportError( "`Set Text Alignment` block could not find text alignment information on an instance called [owner]." );
        return;
      }
      this.owner.setAlign( "center" );
      if ( this.owner.width === 0 ) {
        this.owner.width = 1;
        this.owner.displayOriginX = this.owner.width * 0.5;
        this.owner.width = 0;
      } else {
        this.owner.displayOriginX = this.owner.width * 0.5;
      }
      this.receivedPlayerList = false;
      this.players = [];
    }

    executeMessageenemy_ship () {
      // Executed when the 'enemy ship' is received.
      this.enemy_ship = (this.errorCheckNotNull( this.value, this.owner, "`Get Class Of Instance` block could not find an instance named [value].")).name;
    }

    onKeyInput13 () {
      this.latest_chat = this.promptUser( 'Type your message here' );
      this.owner.components.getByName( "TextAutomation" )[ 0 ].text = ([this.my_name,': ',this.latest_chat].join(''));
      this.scene.messageExternal( 'game-out', ['chat', this.my_name, this.latest_chat] );
    }

    EVENTS_POST_UPDATE () {
      // Executed every frame.
      // position name and chat
      this.owner.x = (this.errorCheckNotNull2( this.ship, this.owner, "`Get Position Center of Instance` block could not find an instance named [ship ].")).x + 0;
      this.owner.y = (this.errorCheckNotNull3( this.ship, this.owner, "`Get Position Center of Instance` block could not find an instance named [ship ].")).y + 60;
    }

    executeMessagegame_in () {
      // Executed when the 'game-in' is received.
      // new player checking if other players are connected
      if (this.value[0] == 'anyoneThere?') {
        if (this.value.slice(-1)[0] != this.my_random_id) {
          this.scene.messageExternal( 'game-out', ['playerList', this.players] );
        }
      }
      // new player creating name and checking it against list
      if (this.value[0] == 'playerList') {
        if (this.receivedPlayerList == false) {
          if (!this.players.length) {
            this.receivedPlayerList = true;
            this.temp_list = this.value.slice(-1)[0];
            this.my_name = this.promptUser( 'What is your name?' );
            var i_list = this.temp_list;
            for (var i_index in i_list) {
              this.i = i_list[i_index];
              if (this.my_name == this.i) {
                this.my_name = this.promptUser( 'Sorry, that name is taken. Pick another.' );
                break;
              }
            }
            this.scene.messageInstance( this.ship, 'name', this.my_name );
            this.owner.components.getByName( "TextAutomation" )[ 0 ].text = this.my_name;
            if ( !this.owner.setAlign ) {
              this.reportError( "`Set Text Alignment` block could not find text alignment information on an instance called [owner]." );
              return;
            }
            this.owner.setAlign( "center" );
            if ( this.owner.width === 0 ) {
              this.owner.width = 1;
              this.owner.displayOriginX = this.owner.width * 0.5;
              this.owner.width = 0;
            } else {
              this.owner.displayOriginX = this.owner.width * 0.5;
            }
            this.scene.messageExternal( 'game-out', ['player connected', this.my_name] );
            if ( !this.players ) {
              this.reportError( "`Add to List` block could not find a list called [players]." );
              return;
            }
            this.players.push( this.my_name );
          }
        }
      }
      // player connected, add them to my game
      if (this.value[0] == 'player connected') {
        if (this.value.slice(-1)[0] != this.my_name) {
          var instance = this.scene.addSpriteByName( this.enemy_ship );
          this.other_player_name = this.value.slice(-1)[0];
          this.scene.messageInstance( instance, 'player name', this.other_player_name );
          this.scene.messageExternal( 'game-out', ['createPlayer', this.my_name] );
          if ( !this.players ) {
            this.reportError( "`Add to List` block could not find a list called [players]." );
            return;
          }
          this.players.push( (this.value.slice(-1)[0]) );
        }
      }
      // create existing players when I join
      if (this.value[0] == 'createPlayer') {
        var existing_player_name_list = this.players;
        for (var existing_player_name_index in existing_player_name_list) {
          this.existing_player_name = existing_player_name_list[existing_player_name_index];
          if (this.value[1] != this.existing_player_name) {
            if (this.value[1] != this.my_name) {
              var instance = this.scene.addSpriteByName( this.enemy_ship );
              this.scene.messageInstance( instance, 'player name', (this.value[1]) );
              if ( !this.players ) {
                this.reportError( "`Add to List` block could not find a list called [players]." );
                return;
              }
              this.players.push( (this.value.slice(-1)[0]) );
            }
          }
        }
      }
      // disconnect a player that another player has removed
      if (this.value[0] == 'disconnectPlayer') {
        if (this.value[1] == this.my_name) {
          if ( 1 <= ( this.game.levelManager.levels.indexOf( this.scene ) + 1 ) && ( this.game.levelManager.levels.indexOf( this.scene ) + 1 ) <= this.game.levelManager.levels.length ) {
            this.game.levelManager.switchTo( ( this.game.levelManager.levels.indexOf( this.scene ) + 1 ) );
          } else {
            ( function() {
              var message = "`Go to level` block could not go to level number ( this.game.levelManager.levels.indexOf( this.scene ) + 1 ). Level numbers start at 1 and go up to the total number of levels in your game (" + this.game.levelManager.levels.length + ").";
              this.game.reportError( message, message, "SCRIPT ERROR" );
            } ).bind( this )();
          }
        }
      }
    }

    executeMessageremove_player_from_list () {
      // Executed when the 'remove player from list' is received.
      this.list.splice((this.list.indexOf(this.value) + 1) - 1, 1);
      this.scene.messageExternal( 'game-out', ['disconnectPlayer', this.value] );
    }

    reportError( message ) {
      message = "(" + this.name.replace( /_[\d]+$/, "" ) + ")" + message;
      console.trace( message );
      this.game.reportError( message, message, "SCRIPT ERROR" );
    }

    onMessageReceived ( name, message ) {

      if ( message === 'enemy ship' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessageenemy_ship();
      }

      if ( message === 'game-in' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessagegame_in();
      }

      if ( message === 'remove player from list' ) {
        this.value = this.owner.properties.get( "_messaging-value_" );
        this.executeMessageremove_player_from_list();
      }

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

    promptUser ( message ) {
      this.scene.physics.pause();
      var val = window.prompt( message );
      this.scene.physics.resume();
      return val;
    }

    onLevelStart2() {
      this.ship = this.scene.getChildrenByTag( 'ship' )[ 0 ];
      this.my_random_id = this.math_random_int( 1, 999999999999 );
      this.scene.messageExternal( 'game-out', ['anyoneThere?', this.my_random_id] );
      this.delayed_event = this.scene.time.delayedCall( 1000, function() {
        if ( !this.owner || this.owner.exists === false ) {
          return;
        }
          if (this.receivedPlayerList == false) {
          if (!this.players.length) {
            this.receivedPlayerList = true;
            this.my_name = this.promptUser( 'What is your name?' );
            this.scene.messageInstance( this.ship, 'name', this.my_name );
            this.owner.components.getByName( "TextAutomation" )[ 0 ].text = this.my_name;
            if ( !this.owner.setAlign ) {
              this.reportError( "`Set Text Alignment` block could not find text alignment information on an instance called [owner]." );
              return;
            }
            this.owner.setAlign( "center" );
            if ( this.owner.width === 0 ) {
              this.owner.width = 1;
              this.owner.displayOriginX = this.owner.width * 0.5;
              this.owner.width = 0;
            } else {
              this.owner.displayOriginX = this.owner.width * 0.5;
            }
            this.scene.messageExternal( 'game-out', ['player connected', this.my_name] );
            if ( !this.players ) {
              this.reportError( "`Add to List` block could not find a list called [players]." );
              return;
            }
            this.players.push( this.my_name );
          }
        }
      }, null, this );

    }

    errorCheckNotNull2( input, backup, message ) {
      if( !input ) {
        reportError( message );
        return backup;
      }
      return input;
    }

    errorCheckNotNull3( input, backup, message ) {
      if( !input ) {
        reportError( message );
        return backup;
      }
      return input;
    }

  }
);