import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { CommandService } from '@app/services/command.service';
import { environment } from '@env/environment';
import { Line } from 'src/data';
import { WELCOME_MESSAGES } from 'src/data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('terminalInput') inputElement!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalDiv') terminalDiv!: ElementRef<HTMLDivElement>;

  private loadingInterval: any;
  output: Line[] = [];
  input = '';
  history: string[] = [];
  historyIndex = -1;
  private debounceTimer: number | null = null;
  isAwaitingInput = true;
  isSelectingTheme = false;
  optionsIndex = 0; // Index for selecting options
  currentDirectory = 'root';
  currentUser = 'guest';

  constructor(
    private commandService: CommandService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {
    this.authService.user$.subscribe((user) => {
      if (user) {
        localStorage.setItem(
          'user',
          JSON.stringify({ displayName: user.displayName, email: user.email })
        );
        this.currentUser = user.displayName || 'guest';
      } else {
        localStorage.removeItem('user');
        this.currentUser = 'guest';
      }
    });

    this.addNameBanner();
    this.initializeTerminal();
    this.initilizeTheme();
  }

  initilizeTheme() {
    let theme = localStorage.getItem('theme');
    if (!theme) {
      theme = 'dark-mode';
      localStorage.setItem('theme', theme);
    }

    document.body.className = theme;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.isSelectingTheme) {
      if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        this.navigateOptions(event.key);
      } else if (event.key === 'Enter') {
        this.selectTheme();
      }
    } else {
      this.handleCommandNavigation(event);
    }
  }

  private handleCommandNavigation(event: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      this.navigateHistory(event.key);
    }
  }

  executeCommand(): void {
    if (!this.input.trim()) return;
    this.history.push(this.input);
    this.historyIndex = this.history.length; // Reset index for new command entry

    if (this.input.toLowerCase() === 'theme') {
      this.startThemeSelection();
    } else if (this.input.toLowerCase() === 'clear') {
      this.output = [];
      this.history = [];
    } else if (this.input.toLowerCase() === 'reload') {
      location.reload();
    } else {
      this.processCommand();
    }

    this.input = '';
    this.focusInput();
    this.smoothScrollToBottom(this.terminalDiv.nativeElement);
  }

  private startThemeSelection() {
    this.output.push({
      text: `<span class='user-input'><span class='curr-user'>${
        this.currentUser
      } </span><span class='curr-dir'><span class='curr-in'>in</span> ${
        this.currentDirectory
      }</span>: ${this.input.split(' ')[0]}</span>`,
    });

    this.isSelectingTheme = true;
    this.optionsIndex = this.output.length;
    const themeOptions = [
      { text: 'Dark mode', active: false },
      { text: 'Light mode', active: false },
      // { text: 'Old School mode', active: false },
    ];

    themeOptions[0].active = true;
    this.output.push(...themeOptions);
  }

  private async processCommand() {
    this.output.push({
      text: `<span class='user-input'><span class='curr-user'>${
        this.currentUser
      } </span><span class="curr-dir"><span class="curr-in">in</span> ${
        this.currentDirectory
      }</span>: ${this.input.split(' ')[0]}</span>`,
    });

    if (this.input.toLowerCase().startsWith('fetch')) {
      this.startLoadingAnimation();
      try {
        const outputText = await this.commandService.executeCommand(this.input);
        this.stopLoadingAnimation(outputText);
      } catch (error) {
        this.stopLoadingAnimation(`Error: ${error.message}`);
      }
    } else {
      const outputText = await this.commandService.executeCommand(this.input);
      if (Array.isArray(outputText)) {
        outputText.forEach((line) => this.output.push({ text: line }));
      } else {
        this.output.push({ text: outputText });
      }
    }
  }

  // A better dots loading animation
  // "interval": 80,
  // 	"frames": [
  // 		"⠋",
  // 		"⠙",
  // 		"⠹",
  // 		"⠸",
  // 		"⠼",
  // 		"⠴",
  // 		"⠦",
  // 		"⠧",
  // 		"⠇",
  // 		"⠏"
  // 	]

  private startLoadingAnimation() {
    const frames = ['|', '/', '-', '\\'];

    let frameIndex = 0;

    this.output.push({ text: frames[0] }); // Start with the first frame
    let lastLineIndex = this.output.length - 1;

    this.loadingInterval = setInterval(() => {
      this.output[lastLineIndex].text = frames[frameIndex];
      frameIndex = (frameIndex + 1) % frames.length;
      this.smoothScrollToBottom(this.terminalDiv.nativeElement);
    }, 500); // Change frame every 500ms
  }

  private stopLoadingAnimation(finalMessage: string | string[]) {
    clearInterval(this.loadingInterval);
    let lastLineIndex = this.output.length - 1;

    // Clear the loading message
    this.output.splice(lastLineIndex, 1); // Removes the loading message

    // Check if the message is an array and handle it
    if (Array.isArray(finalMessage)) {
      finalMessage.forEach((msg) => this.output.push({ text: msg }));
    } else {
      this.output.push({ text: finalMessage });
    }

    this.smoothScrollToBottom(this.terminalDiv.nativeElement);
  }

  navigateHistory(key: string) {
    if (this.history.length === 0) return; // Exit if no history

    this.historyIndex += key === 'ArrowUp' ? -1 : 1;
    this.historyIndex =
      (this.historyIndex + this.history.length) % this.history.length;

    this.input = this.history[this.historyIndex];
    this.focusInput();
  }

  navigateOptions(key: string) {
    const startIdx = this.optionsIndex;
    const endIdx = this.output.length - 1;
    let currentActiveIndex = this.output.findIndex(
      (option, idx) => option.active && idx >= startIdx && idx <= endIdx
    );

    if (currentActiveIndex !== -1) {
      this.output[currentActiveIndex].active = false;

      if (key === 'ArrowUp' && currentActiveIndex > startIdx) {
        currentActiveIndex--;
      } else if (key === 'ArrowDown' && currentActiveIndex < endIdx) {
        currentActiveIndex++;
      }

      this.output[currentActiveIndex].active = true;
    }
  }

  selectTheme() {
    const selectedThemeIndex = this.output.findIndex((option) => option.active);
    this.output[selectedThemeIndex].active = false;
    const selectedTheme = this.output[selectedThemeIndex].text;

    // Update the theme
    let themeClassName = selectedTheme.toLowerCase().replace(' ', '-');
    document.body.className = themeClassName;
    localStorage.setItem('theme', themeClassName);

    this.output.push({
      text: `<span class="response">Theme selected: ${selectedTheme}</span>`,
    });

    this.isSelectingTheme = false;
    this.focusInput();
  }

  focusInput() {
    this.inputElement.nativeElement.focus();
  }

  smoothScrollToBottom(element: HTMLElement) {
    if (!this.debounceTimer) {
      this.debounceTimer = window.setTimeout(() => {
        element.scrollTop = element.scrollHeight;
        this.debounceTimer = null;
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    this.focusInput();
    this.checkLocalStorageForUser();
  }

  private checkLocalStorageForUser(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user).displayName;
    } else {
      this.currentUser = 'guest';
    }

    this.cdRef.detectChanges();
  }

  private addNameBanner(): void {
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

  private initializeTerminal(): void {
    this.output.push(
      {
        text: `Aaron's Portfolio [Version: <span class="highlight">${environment.version}</span>]`,
        spacing: 2,
      },
      {
        text: '2024 AyeZeeWebDesigns LLC. All rights reserved.',
        spacing: 8,
      },
      {
        text: WELCOME_MESSAGES[
          Math.floor(Math.random() * WELCOME_MESSAGES.length)
        ],
        spacing: 2,
      }
      // {
      //   text: 'Welcome to the terminal! Type <span class="muted">HELP</span> for a list of commands.',
      // }
    );
  }
}
