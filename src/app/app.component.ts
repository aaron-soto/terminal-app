import {
  AfterViewInit,
  Component,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Line, COMMANDS, FUN_FACTS, TIPS } from '../data';
import { environment } from '@env/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  @ViewChild('terminalInput') inputElement!: ElementRef;
  @ViewChild('terminalDiv') terminalDiv!: ElementRef<HTMLDivElement>;

  output: Line[] = [];
  input: string;
  commands = COMMANDS;
  tips = TIPS;
  tipIdx = Math.floor(Math.random() * this.tips.length);
  funfacts = FUN_FACTS;
  history: string[] = [];
  historyIndex = 0;
  private debounceTimer: any;
  isAwaitingInput: boolean = true;
  isSelectingTheme: boolean = false;

  constructor() {
    this.input = '';
    this.addBanner();
    this.output.push(
      // {
      //   Example of a line with a link
      //   text: 'Please try to <a href="#1">go back</a>',
      // },
      {
        text: `Aaron's Portfolio [Version <span class="white">${environment.version}</span>]`,
        spacing: 2,
      },
      {
        text: '2024 AyeZeeWebDesigns LLC. All rights reserved.',
        spacing: 8,
      },
      {
        text: 'Welcome to the terminal! Type <span class="muted">HELP</span> for a list of commands.',
      }
    );
  }

  nextTip() {
    this.tipIdx = (this.tipIdx + 1) % this.tips.length;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.history.length === 0) {
      // If there is no history, do nothing
      return;
    }

    if (this.isSelectingTheme) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        this.output.forEach((line, index) => {
          if (line.type === 'select') {
            line.active = false;
          }
        });
        this.output[
          event.key === 'ArrowUp'
            ? this.output.length - 2
            : this.output.length - 1
        ].active = true;
      }

      if (event.key === 'Enter') {
        this.output.forEach((line, index) => {
          if (line.type === 'select' && line.active) {
            this.output.push({
              text: `<span class='response'>selected theme:</span> ${line.text.toLowerCase()}`,
            });
            this.isSelectingTheme = false;
            this.isAwaitingInput = true;
            line.active = false;
            this.focusInput();
          }
        });
      }
    }

    if (event.key === 'ArrowUp') {
      if (this.historyIndex > 0) {
        this.historyIndex--;
      } else {
        this.historyIndex = this.history.length - 1; // Wrap around to the last item
      }
      this.focusInput();
      this.input = this.history[this.historyIndex];
    }

    if (event.key === 'ArrowDown') {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
      } else {
        this.historyIndex = 0; // Wrap around to the first item
      }
      this.focusInput();
      this.input = this.history[this.historyIndex];
    }
  }

  ngAfterViewInit(): void {
    this.focusInput();
  }

  smoothScrollToBottom(element: any): void {
    const start = element.scrollTop;
    const end = element.scrollHeight - element.clientHeight;
    const change = end - start;
    const duration = 100; // Duration in milliseconds
    let startTime: number | null = null;

    const animateScroll = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const timeElapsed = currentTime - startTime;
      const nextStep = this.easeInOutQuad(timeElapsed, start, change, duration);

      element.scrollTop = nextStep;

      if (timeElapsed < duration) {
        requestAnimationFrame(animateScroll);
      } else {
        element.scrollTop = end;
      }
    };

    requestAnimationFrame(animateScroll);
  }

  easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  }

  addBanner(): void {
    this.output.push(
      {
        text: ' █████╗  █████╗ ██████╗  ██████╗ ███╗   ██╗    ███████╗ ██████╗ ████████╗ ██████╗ ',
      },
      {
        text: '██╔══██╗██╔══██╗██╔══██╗██╔═══██╗████╗  ██║    ██╔════╝██╔═══██╗╚══██╔══╝██╔═══██╗',
      },
      {
        text: '███████║███████║██████╔╝██║   ██║██╔██╗ ██║    ███████╗██║   ██║   ██║   ██║   ██║',
      },
      {
        text: '██╔══██║██╔══██║██╔══██╗██║   ██║██║╚██╗██║    ╚════██║██║   ██║   ██║   ██║   ██║',
      },
      {
        text: '██║  ██║██║  ██║██║  ██║╚██████╔╝██║ ╚████║    ███████║╚██████╔╝   ██║   ╚██████╔╝',
      },
      {
        text: '╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚══════╝ ╚═════╝    ╚═╝    ╚═════╝ ',
      }
    );
  }

  executeCommand(): void {
    if (this.input.trim() !== '') {
      this.output.push({
        text:
          '<span class="prompt">$</span>' +
          `<span class='user-input'>${this.input}</span>`,
      });

      this.history.push(this.input);
      this.historyIndex = this.history.length - 1;

      switch (this.input.trim().toLowerCase()) {
        case 'help':
          this.commands.forEach((command) => {
            this.output.push({
              text: `<span class='help-command response'>${command.command}</span> ${command.help}`,
            });
          });
          this.output.push({
            text: 'For more information on a specific command, type <span class="muted">HELP</span> command-name',
            spacing: 4,
          });
          break;
        case 'tip':
          this.output.push({
            text: `<span class="response">[TIP]:</span> ${
              this.tips[this.tipIdx]
            }`,
          });
          this.nextTip();
          break;
        case 'hello':
          this.output.push({
            text: 'Hello there!',
          });
          break;
        case 'refresh':
          window.location.reload();
          break;
        case 'funfact':
        case 'fact':
          this.output.push({
            text: this.funfacts[
              Math.floor(Math.random() * this.funfacts.length)
            ],
          });
          break;
        case '--version':
        case '--v':
        case 'version':
          this.output.push({
            text: `Terminal: <span class="white">${environment.version}</span>`,
          });
          break;
        case 'theme':
          this.isAwaitingInput = false;
          this.isSelectingTheme = true;
          this.output.push({
            text: 'Select A theme',
          });
          this.output.push({
            text: 'light',
            type: 'select',
            active: true,
          });
          this.output.push({
            text: 'dark',
            type: 'select',
            active: false,
          });
          break;
        case 'clear':
          this.output = [];
          break;
        default:
          this.output.push({
            text: `'${this.input}' is probably a cool command, but I don’t know it yet. Type help to see what I can do!`,
          });
      }
    }
    if (!this.isSelectingTheme) {
      setTimeout(() => {
        this.input = ''; // Clear input
        this.focusInput(); // Refocus the input field
        this.smoothScrollToBottom(this.terminalDiv.nativeElement);
      }, 0);
    }
  }

  focusInput() {
    this.inputElement.nativeElement.focus();
  }
}
