// Rendering/editing gantt diagram
// Started on: 23.12.2010

(function($){
  // to pixels
  //
  function px( i ) {
    return "" + i + "px";
  }

  //
  function absolutePos( l, t, w, h ) {
    return {
      position: "absolute",
      left: px( l ),
      top: px( t ),
      width: px( w ),
      height: px( h )
    };
  }

  // Main behaviour placed here
  //
  //
  function GanttSequence( div, opts ) {
    return {
      element: div,
      options: opts,

      hoursPerDay: 8,
      
      hourWidth: 20,
      dayHeaderHeight: 16,
      hourHeaderHeight: 16,
      headerFont: "14px georgia",
      headerBackground: "#B6D5DB",

      eventHeight: 20,
      eventHalfMargin: 2,

      dayWidth: function() {
        return this.hoursPerDay * this.hourWidth;
      },

      headersHeight: function() {
        return this.dayHeaderHeight + this.hourHeaderHeight;
      },

      render: function() {
        this.element.css({
          position: "relative",
          border: "solid 1px #000",
          minHeight: "20px",
          minWidth: "15px"
        }).text("");

        this.resizeToContainDays();
        this.renderDays();
        this.renderEvents();
      },
      
      resizeToContainDays: function() {
        this.element.css({
          width: px( this.options.days.length * this.dayWidth() + 1 ),
          height: px( this.headersHeight() + this.options.events.length * this.eventHeight + 1 )
        });
      },

      renderDays: function() {
        var $this = this.element;
        var $self = this;
        var $dayWidth = this.dayWidth();
        var $first = true;
        
        $.each( this.options.days, function( i, elt ) {
          var $div = $("<div class='day'>").appendTo( $this ).css(
            absolutePos( i * $dayWidth, 0, 
                         $dayWidth, parseInt( $this.css( "height" ) ) )
          );

          if( !$first ) { $div.css({borderLeft: "solid 1px #000"}); }

          $self.renderHeader( $div, elt );
          $self.renderHours( $div );

          $first = false;
        });
      },

      renderHeader: function( div, text ) {
        var $headerDiv = $("<div class='day-header'>").appendTo( div ).css({
          font: this.headerFont,
          textAlign: "center",
          height: px( this.dayHeaderHeight - 1 ),
          borderBottom: "solid 1px #000",
          backgroundColor: this.headerBackground
        }).text( text );
      },

      renderHours: function( div ) {
        var $first = true;
        for( var $i = 0; $i < this.hoursPerDay; ++$i ) {
          var $hourDiv = $( "<div class='hour'>" ).appendTo( div ).css(
            absolutePos( $i * this.hourWidth, this.dayHeaderHeight, 
                         $first ? this.hourWidth : this.hourWidth - 1,          // width
                         parseInt( div.css("height") ) - this.dayHeaderHeight ) // height
          );
          
          if( !$first ) { $hourDiv.css({borderLeft: "dotted 1px #000"}); }

          this.renderHourHeader( $hourDiv, $i );
          $first = false;
        }
      },

      renderHourHeader: function( div, pos ) {
        $( "<div class='hour-header'>" ).text( "" + ( pos + 1 ) ).appendTo( div ).css({
          font: this.headerFont,
          height: px( this.hourHeaderHeight - 1 ),
          textAlign: "center",
          backgroundColor: this.headerBackground,
          borderBottom: "solid 1px #000"
        });
      },

      renderEvents: function() {
        var $this = this.element;
        var $self = this;

        $.each( this.options.events, function( i, event ) {
          var $eventDiv = $( "<div class='event'>" ).appendTo( $this ).css(
            absolutePos( 
              $self.calculateLeft( event.start ),                                       // left
              $self.headersHeight() + i * $self.eventHeight + $self.eventHalfMargin,    // top
              $self.hourWidth * event.duration - 2,                                     // width
              $self.eventHeight - 2 * $self.eventHalfMargin )                           // height
          ).css({
            backgroundColor: "#fea",
            cursor: "pointer",
            border: "solid 1px #ddd",
            opacity: "0.75"
          });


          $eventDiv.click(function(){$("#message").text( event.title );});

          if( event.fixed ) {
            $eventDiv.css({backgroundColor: "#eda"}).attr( "title", event.title + " fixed" );
          } else {
            $eventDiv.draggable({axis: "x", grid: [ $self.hourWidth / 2, 1 ]});
            $eventDiv.hover( 
              function() { $(this).css({backgroundColor: "#f00"}); }, 
              function() { $(this).css({backgroundColor: "#fea"}); }
            ).attr( "title", event.title );
          }
        });
      },

      calculateLeft: function( startString ) {
        var $arr = startString.split( "/" );
        var $dayStr = $arr[ 0 ];
        var $hourStr = $arr[ 1 ];
        var $dayIndex = this.options.days.indexOf( $dayStr );

        if( $dayIndex == -1 )
          return -1;

        var $dayOffset = $dayIndex * this.dayWidth();
        var $hourOffset = parseFloat( $hourStr ) * this.hourWidth;

        return $dayOffset + $hourOffset + 1;
      }

    };
  }

  $.fn.gantt = function( opts ) {
    return this.each( function() {
      var $this = $(this);
      $this.data( "gantt", GanttSequence( $this, opts ) );
      $this.data( "gantt" ).render();
    } );
  };
})(jQuery);
