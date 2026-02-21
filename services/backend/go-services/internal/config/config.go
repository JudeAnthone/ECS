package config

var AppConfig *Config

func Init() error {
	config, err := Load()
	if err != nil {
		return err
	}
	AppConfig = config
	return nil
}
