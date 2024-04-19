import { Injectable } from '@angular/core';
import { TIPS, FUN_FACTS } from '../../data';
import { WeatherService } from '@app/services/weather.service';
import { AuthService } from '@app/services/auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommandService {
  private commands;
  private additionalCommands;

  constructor(private weatherService: WeatherService) {
    this.commands = {
      help: { execute: this.help, helpText: 'Display this help' },
      date: { execute: this.date, helpText: 'Display the current date' },
      echo: { execute: this.echo, helpText: 'Repeat the input' },
      fetch: { execute: this.fetch, helpText: 'Fetch the current weather' },
      fact: { execute: this.fact, helpText: 'Display a fun fact about Aaron' },

      tip: {
        execute: this.tip,
        helpText: 'Display a tip about this terminal',
      },
    };
    this.additionalCommands = {
      theme: { helpText: 'Change the terminal theme' },
      clear: { helpText: 'Clear the terminal screen' },
      reload: { helpText: 'Reload the terminal screen' },
      login: { helpText: 'Login to the system' },
      register: {
        helpText: 'Register an account for the terminal',
      },
      logout: { helpText: 'Logout of the system' },
    };
  }

  async executeCommand(input: string): Promise<string | string[]> {
    const [command, ...args] = input.split(' ');
    const commandFunction = this.commands[command]?.execute;

    if (commandFunction) {
      try {
        return await commandFunction.call(this, args);
      } catch (error: any) {
        return `Error executing command: ${error.message}`;
      }
    }

    return `'${command}' sounds like a cool command. Type "help" for a list of real commands.`;
  }

  private help = (): string[] => {
    let helpTexts = [];

    for (const command in this.commands) {
      helpTexts.push(
        `<span class="help-command response">${command.toLocaleUpperCase()}</span> ${
          this.commands[command].helpText
        }.`
      );
    }

    for (const command in this.additionalCommands) {
      helpTexts.push(
        `<span class="help-command response">${command.toLocaleUpperCase()}</span> ${
          this.additionalCommands[command].helpText
        }.`
      );
    }

    return helpTexts;
  };

  private fact = (): string =>
    FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)] ||
    'No fun facts available.';

  private tip = (): string =>
    TIPS[Math.floor(Math.random() * TIPS.length)] || 'No tips available.';

  private date = (args?: string[]): string => {
    let adjustment = 0;
    if (args && args.length > 0) {
      adjustment = parseInt(args[0], 10);
      if (isNaN(adjustment)) {
        return 'Invalid date adjustment. Please provide a number of days.';
      }
    }
    const today = new Date();
    today.setDate(today.getDate() + adjustment);
    return today.toLocaleString();
  };

  private echo = (args?: string[]): string => args?.join(' ') || '';

  private fetch = async (args?: string[]): Promise<string> => {
    let pos1Arg = args?.[0];

    if (pos1Arg === 'weather') {
      try {
        const data: any = await firstValueFrom(
          this.weatherService.getWeather()
        );
        return `It currently feels like ${data.current.feelslike_f}°F in Phoenix!`;
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        return 'Failed to fetch weather data.';
      }
    } else if (pos1Arg === 'joke') {
      return 'Dad joke here: blah blah blah';
    }
    return '';
  };
}
