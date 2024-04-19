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
import { WELCOME_MESSAGES, LOADING_INDICATORS } from 'src/data';

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
  showInputField = true;
  isSelectingTheme = false;
  optionsIndex = 0; // Index for selecting options
  currentDirectory = 'root';
  currentUser = { email: 'guest' };

  constructor(
    private commandService: CommandService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) {
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
        this.showInputField = true;
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
      this.showInputField = false;
      this.startThemeSelection();
    } else if (this.input.split(' ')[0].toLowerCase() === 'login') {
      let email = this.input.split(' ')[1];
      let password = this.input.split(' ')[2];

      this.login(email, password);
    } else if (this.input.toLowerCase() === 'logout') {
      this.logout();
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

  register(email: string, password: string) {
    this.authService.register(email, password).subscribe({
      next: (resp) => {
        this.currentUser = resp.user;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log('Registered as:', this.currentUser);
        this.cdRef.detectChanges();
      },
      error: () => {
        console.error('Registration failed');
      },
    });
  }

  login(email, password) {
    this.authService.login(email, password).subscribe({
      next: (resp) => {
        this.currentUser = resp.user;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log('Logged in as:', this.currentUser);
        this.cdRef.detectChanges();
      },
      error: () => {
        console.error('Login failed');
      },
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = { email: 'guest' };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log('Logged out');
      },
    });
  }

  private startThemeSelection() {
    this.output.push({
      text: `<span class='user-input'><span class='curr-user'>${
        this.currentUser.email
      } </span><span class='curr-dir'><span class='curr-in'>in</span> ${
        this.currentDirectory
      }</span>: ${this.input.split(' ')[0]}</span>`,
    });

    this.isSelectingTheme = true;
    this.optionsIndex = this.output.length;
    const themeOptions = [
      { text: 'Dark mode', active: false },
      { text: 'Light mode', active: false },
      { text: 'Pastel mode', active: false },
      { text: 'High Contrast mode', active: false },
      { text: 'Nature mode', active: false },
      { text: 'Hacker mode', active: false },
      { text: 'Ocean mode', active: false },
      // { text: 'Old School mode', active: false },
    ];

    themeOptions[0].active = true;
    this.output.push(...themeOptions);
  }

  private async processCommand() {
    this.output.push({
      text: `<span class='user-input'><span class='curr-user'>${
        this.currentUser.email
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

  private startLoadingAnimation() {
    // dots, dots12, arc, bouncingBar, bouncingBall, moon, pong, shark
    let loadingAnimationSelected = 'dots';
    let frameIndex = 0;

    this.output.push({
      text: LOADING_INDICATORS[loadingAnimationSelected].frames[0],
    });

    let lastLineIndex = this.output.length - 1;

    this.loadingInterval = setInterval(() => {
      this.output[lastLineIndex].text =
        LOADING_INDICATORS[loadingAnimationSelected].frames[frameIndex];
      frameIndex =
        (frameIndex + 1) %
        LOADING_INDICATORS[loadingAnimationSelected].frames.length;
      this.smoothScrollToBottom(this.terminalDiv.nativeElement);
    }, LOADING_INDICATORS[loadingAnimationSelected].interval);
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
    this.cdRef.detectChanges();
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
    this.checkAuthenticationStatus();
  }

  checkAuthenticationStatus(): void {
    // Ideally, your backend should have a route to check the current user's session status
    // For example, this could be implemented in your backend as an '/auth/status' route
    this.authService.getSessionStatus().subscribe({
      next: (response) => {
        if (response.isAuthenticated) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUser = response.user;
        } else {
          this.currentUser = { email: 'guest' };
          localStorage.setItem(
            'currentUser',
            JSON.stringify({ email: 'guest' })
          );
        }
      },
      error: () => {
        this.currentUser = { email: 'guest' };
        localStorage.setItem('currentUser', JSON.stringify({ email: 'guest' }));
      },
    });
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
        text: `Aaron's Portfolio [Version: <span class="highlight">${environment.version}</span>] <a target='_blank' href='https://github.com/aaron-soto/terminal-app?tab=readme-ov-file#%F0%9F%91%8D-contribute'>Github Link</a>`,
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
