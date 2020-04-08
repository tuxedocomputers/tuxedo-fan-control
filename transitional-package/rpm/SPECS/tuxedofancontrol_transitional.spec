%define module tuxedofancontrol

#
# spec file for package tuxedofancontrol
#
# Copyright (c) 2019 SUSE LINUX GmbH, Nuernberg, Germany.
#
# All modifications and additions to the file contributed by third parties
# remain the property of their copyright owners, unless otherwise agreed
# upon. The license for this file, and modifications and additions to the
# file, is the same license as for the pristine package itself (unless the
# license for the pristine package is not an Open Source License, in which
# case the license is the MIT License). An "Open Source License" is a
# license that conforms to the Open Source Definition (Version 1.9)
# published by the Open Source Initiative.

# Please submit bugfixes or comments via http://bugs.opensuse.org/
#


Summary:        Transitional package tuxedofancontrol -> tuxedo-control-center
Name:           %{module}
Version:        0.1.10
Release:        1
Vendor:         Christian Loritz / TUXEDO Computers GmbH <tux@tuxedocomputers.com>
License:        GPLv3+
BuildArch:      noarch
Url:            https://www.tuxedocomputers.com
Requires:       tuxedo-control-center >= 1.0.0
Packager:       C Sandberg <tux@tuxedocomputers.com>

%description
This package is empty and can be removed. Transitional package
needed because of vendor change. The functionality of tuxedofancontrol
is completely replaced with tuxedo-control-center.


%prep

%install

%clean

%files

%post
exit 0

%preun
exit 0


%changelog
* Mon Apr 6 2020 C Sandberg <tux@tuxedocomputers.com> 0.1.10-1
- Obsolete tuxedofancontrol and replace with tuxedo-control-center