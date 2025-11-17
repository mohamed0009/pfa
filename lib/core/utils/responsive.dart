import 'package:flutter/material.dart';

/// Responsive breakpoints for different screen sizes
class Breakpoints {
  static const double mobile = 600;
  static const double tablet = 900;
  static const double desktop = 1200;
  static const double wide = 1600;
}

/// Device type enum
enum DeviceType {
  mobile,
  tablet,
  desktop,
  wide,
}

/// Responsive utility class
class Responsive {
  /// Get device type based on screen width
  static DeviceType getDeviceType(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < Breakpoints.mobile) {
      return DeviceType.mobile;
    } else if (width < Breakpoints.tablet) {
      return DeviceType.tablet;
    } else if (width < Breakpoints.desktop) {
      return DeviceType.desktop;
    } else {
      return DeviceType.wide;
    }
  }

  /// Check if device is mobile
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < Breakpoints.mobile;

  /// Check if device is tablet
  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= Breakpoints.mobile && width < Breakpoints.tablet;
  }

  /// Check if device is desktop
  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= Breakpoints.tablet;

  /// Check if device is wide screen
  static bool isWide(BuildContext context) =>
      MediaQuery.of(context).size.width >= Breakpoints.wide;

  /// Get responsive value based on device type
  static T valueWhen<T>({
    required BuildContext context,
    required T mobile,
    T? tablet,
    T? desktop,
    T? wide,
  }) {
    final deviceType = getDeviceType(context);
    switch (deviceType) {
      case DeviceType.mobile:
        return mobile;
      case DeviceType.tablet:
        return tablet ?? mobile;
      case DeviceType.desktop:
        return desktop ?? tablet ?? mobile;
      case DeviceType.wide:
        return wide ?? desktop ?? tablet ?? mobile;
    }
  }

  /// Get responsive widget builder
  static Widget builder({
    required BuildContext context,
    required Widget Function(BuildContext context, DeviceType deviceType) builder,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final deviceType = getDeviceType(context);
        return builder(context, deviceType);
      },
    );
  }

  /// Calculate responsive size based on screen width
  static double width(BuildContext context, double percentage) {
    return MediaQuery.of(context).size.width * (percentage / 100);
  }

  /// Calculate responsive height based on screen height
  static double height(BuildContext context, double percentage) {
    return MediaQuery.of(context).size.height * (percentage / 100);
  }

  /// Get responsive font size
  static double fontSize(BuildContext context, double baseSize) {
    final width = MediaQuery.of(context).size.width;
    if (width < Breakpoints.mobile) {
      return baseSize * 0.9;
    } else if (width < Breakpoints.tablet) {
      return baseSize;
    } else if (width < Breakpoints.desktop) {
      return baseSize * 1.1;
    } else {
      return baseSize * 1.2;
    }
  }

  /// Get responsive padding
  static EdgeInsets padding(BuildContext context, {
    double mobile = 16.0,
    double? tablet,
    double? desktop,
  }) {
    final deviceType = getDeviceType(context);
    final value = switch (deviceType) {
      DeviceType.mobile => mobile,
      DeviceType.tablet => tablet ?? mobile * 1.5,
      DeviceType.desktop => desktop ?? tablet ?? mobile * 2,
      DeviceType.wide => desktop ?? tablet ?? mobile * 2.5,
    };
    return EdgeInsets.all(value);
  }

  /// Get number of grid columns based on screen size
  static int gridColumns(BuildContext context, {
    int mobile = 1,
    int? tablet,
    int? desktop,
  }) {
    return valueWhen(
      context: context,
      mobile: mobile,
      tablet: tablet ?? 2,
      desktop: desktop ?? 3,
      wide: 4,
    );
  }

  /// Get max content width for centered layouts
  static double maxContentWidth(BuildContext context) {
    return valueWhen(
      context: context,
      mobile: double.infinity,
      tablet: 800,
      desktop: 1000,
      wide: 1200,
    );
  }
}

/// Responsive widget that rebuilds on orientation/size changes
class ResponsiveBuilder extends StatelessWidget {
  final Widget Function(
    BuildContext context,
    BoxConstraints constraints,
    DeviceType deviceType,
  ) builder;

  const ResponsiveBuilder({
    super.key,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final deviceType = Responsive.getDeviceType(context);
        return builder(context, constraints, deviceType);
      },
    );
  }
}

/// Adaptive widget that renders different widgets based on platform
class AdaptiveWidget extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const AdaptiveWidget({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, constraints, deviceType) {
        switch (deviceType) {
          case DeviceType.mobile:
            return mobile;
          case DeviceType.tablet:
            return tablet ?? mobile;
          case DeviceType.desktop:
          case DeviceType.wide:
            return desktop ?? tablet ?? mobile;
        }
      },
    );
  }
}
