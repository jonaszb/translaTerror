# TranslaTerror

TranslaTerror is an Electron utility app designed specifically for translators. It provides a range of features to streamline the translation process.

## Features
![frag](https://github.com/jonaszb/translaTerror/assets/44910820/80a509cd-fd29-40e6-923d-bfffc5f0d632)

-   Divide docx files into fragments and remove redundancy
-   Translate docx files
-   Transcribe mp3 files
-   Extract data from mxliff files into docx, then insert filled data back into mxliff

## Installation

To install TranslaTerror, please follow these steps:

1. Visit the [releases](https://github.com/jonaszb/translaTerror/releases) page of the GitHub repository.
2. Download the latest version of TranslaTerror for your operating system (Windows or MacOS).
3. Run the downloaded installer to install TranslaTerror on your system.

Please note that the installers provided in the releases are not code signed.

## Usage

Once TranslaTerror is installed, you can launch the application and start using its features. The app provides a user-friendly interface for easy interaction.

## Cloud Functionality

TranslaTerror relies on cloud functions on Google Cloud Platform (GCP) for most of its functionality. A service key is required to access those functions. Contact the developer if you are looking to obtain a key.

## Development

If you prefer to run a local development version of TranslaTerror, you can follow these steps:

1. Clone the repository to your local machine.
2. Open a terminal and navigate to the cloned repository's directory.
3. Run the following commands:
    ```
    yarn install
    yarn dev
    ```
    This will install the necessary dependencies and start the development version of TranslaTerror.

Please note that depending on your operating system settings, TranslaTerror might require superuser permissions to access requested files. If TranslaTerror is not running as a superuser, please ensure that the files you want to work with are located in a publicly accessible folder.

## Contributing

Contributions to TranslaTerror are welcome! If you would like to contribute to the project, please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
