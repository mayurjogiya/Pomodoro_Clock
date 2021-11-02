import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

//Code by Mayur Jogiya

const accurateInterval = function (fn, time) {
  var cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
      nextAt += time;
      timeout = setTimeout(wrapper, nextAt - new Date().getTime());
      return fn();
  };
  cancel = function () {
      return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
      cancel: cancel
  };
};



class TimerLength extends React.Component {

  render() {
      return (
          <div className="length-control">
              <h1 id={this.props.titleID}>{this.props.title}</h1>
              <div class="btn">
                  <button
                      className="btn-level"
                      id={this.props.minID}
                      onClick={this.props.onClick}
                      value="-"
                  >
                      <i className="fa fa-arrow-down fa-2x" />
                  </button>
                  <h1 className="btn-level" id={this.props.lengthID}>
                      {this.props.length}
                  </h1>
                  <button
                      className="btn-level"
                      id={this.props.addID}
                      onClick={this.props.onClick}
                      value="+"
                  >
                      <i className="fa fa-arrow-up fa-2x" />
                  </button>
              </div>
          </div>
      )
  }


}



class Timer extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          breakLength: 5,
          sessionLength: 25,
          timerState: 'stopped',
          timerType: 'Session',
          timer: 1500,
          intervalID: '',
          alarmColor: { color: 'white' }
      };
      this.setBreakLength = this.setBreakLength.bind(this);
      this.setSessionLength = this.setSessionLength.bind(this);
      this.lengthControl = this.lengthControl.bind(this);
      this.timerControl = this.timerControl.bind(this);
      this.beginCountDown = this.beginCountDown.bind(this);
      this.decrementTimer = this.decrementTimer.bind(this);
      this.phaseControl = this.phaseControl.bind(this);
      this.warning = this.warning.bind(this);
      this.buzzer = this.buzzer.bind(this);
      this.switchTimer = this.switchTimer.bind(this);
      this.clockify = this.clockify.bind(this);
      this.reset = this.reset.bind(this);
  }
  setBreakLength(e) {
      this.lengthControl(
          'breakLength',
          e.currentTarget.value,
          this.state.breakLength,
          'Session'
      );
  }
  setSessionLength(e) {
      this.lengthControl(
          'sessionLength',
          e.currentTarget.value,
          this.state.sessionLength,
          'Break'
      );
  }

  lengthControl(stateToChange, sign, currentLength, timerType) {
      if (this.state.timerState === 'running') {
          return;
      }
      if (this.state.timerType === timerType) {
          if (sign === '-' && currentLength !== 1) {
              this.setState({ [stateToChange]: currentLength - 1 });
          } else if (sign === '+' && currentLength !== 60) {
              this.setState({ [stateToChange]: currentLength + 1 });
          }
      } else if (sign === '-' && currentLength !== 1) {
          this.setState({
              [stateToChange]: currentLength - 1,
              timer: currentLength * 60 - 60
          });
      } else if (sign === '+' && currentLength !== 60) {
          this.setState({
              [stateToChange]: currentLength + 1,
              timer: currentLength * 60 + 60
          });
      }
  }

  timerControl() {
      if (this.state.timerState === 'stopped') {
          this.beginCountDown();
          this.setState({ timerState: 'running' });
      } else {
          this.setState({ timerState: 'stopped' });
          if (this.state.intervalID) {
              this.state.intervalID.cancel();
          }
      }
  }

  beginCountDown() {
      this.setState({
          intervalID: accurateInterval(() => {
              this.decrementTimer();
              this.phaseControl();
          }, 1000)
      });
  }

  decrementTimer() {
      this.setState({ timer: this.state.timer - 1 });
  }

  phaseControl() {
      let timer = this.state.timer;
      this.warning(timer);
      this.buzzer(timer);
      if (timer < 0) {
          if (this.state.intervalID) {
              this.state.intervalID.cancel();
          }
          if (this.state.timerType === 'Session') {
              this.beginCountDown();
              this.switchTimer(this.state.breakLength * 60, 'Break');
          } else {
              this.beginCountDown();
              this.switchTimer(this.state.sessionLength * 60, 'Session');
          }
      }
  }

  warning(_timer) {
      if (_timer < 61) {
          this.setState({ alarmColor: { color: '#a50d0d' } });
      } else {
          this.setState({ alarmColor: { color: 'white' } });
      }
  }

  buzzer(_timer) {
      if (_timer === 0) {
          this.audioBeep.play();
      }
  }

  switchTimer(num, str) {
      this.setState({
          timer: num,
          timerType: str,
          alarmColor: { color: 'white' }
      });
  }

  clockify() {
      let minutes = Math.floor(this.state.timer / 60);
      let seconds = this.state.timer - minutes * 60;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return minutes + ':' + seconds;
  }

  reset() {
      this.setState({
          breakLength: 5,
          sessionLength: 25,
          timerState: 'stopped',
          timerType: 'Session',
          timer: 1500,
          intervalID: '',
          alarmColor: { color: 'white' }
      });
      if (this.state.intervalID) {
          this.state.intervalID.cancel();
      }
      this.audioBeep.pause();
      this.audioBeep.currentTime = 0;
  }



  render() {
      return (
          <div>
              <h1 class="head">25 + 5 Clock</h1>
              <div class="btn">
              <TimerLength
                  addID="break-increment"
                  length={this.state.breakLength}
                  lengthID="break-length"
                  minID="break-decrement"
                  onClick={this.setBreakLength}
                  title="Break Length"
                  titleID="break-label"
              />
              <TimerLength
                  addID="session-increment"
                  length={this.state.sessionLength}
                  lengthID="session-length"
                  minID="session-decrement"
                  onClick={this.setSessionLength}
                  title="Session Length"
                  titleID="session-label"
              />
              </div>
              <div id="timers">
                  <div id="timer-wrap">
                      <h1 id="timer-label">{this.state.timerType}</h1>
                      <h2 id="time-left">{this.clockify()}</h2>
                  </div>
                  <div>
                      <button id="start_stop" onClick={this.timerControl}>
                          <i className="fa fa-play fa-2x" />
                          <i className="fa fa-pause fa-2x" />
                      </button>
                      <button id="reset" onClick={this.reset}>
                          <i className="fa fa-refresh fa-2x" />
                      </button>
                  </div>
              </div>
          
              <audio
                  id="beep"
                  preload="auto"
                  ref={(audio) => {
                      this.audioBeep = audio;
                  }}
                  src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
              />
              <div id="ownerInfo">
            MADE BY  <span id="name">mayur jogiya</span>
          </div>
          </div>
      )
  }
}

ReactDOM.render(<Timer />, document.getElementById("root"));
