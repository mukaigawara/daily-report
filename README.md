# Daily Report CLI

A command-line tool that generates daily reports from Git commit history using React and Ink.

## Features

- **Automatic Git Analysis**: Extracts commits from the current day
- **Smart Categorization**: Automatically categorizes commits by type (features, bug fixes, refactoring, etc.)
- **Interactive UI**: Built with React and Ink for a modern CLI experience
- **Time Tracking**: Shows working hours based on commit timestamps
- **Japanese Output**: Generates reports in Japanese format

## Installation

```bash
npm install -g @mukaigawara/daily-report
```

## Usage

Navigate to any Git repository and run:

```bash
daily-report
```

**Note**: The tool must be run inside a Git repository and will only show commits made by the configured Git user for the current date.
